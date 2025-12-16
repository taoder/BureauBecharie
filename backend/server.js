require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db, dbRun, dbGet, dbAll } = require('./database');
const { authenticateToken, requireAdmin, optionalAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ============= AUTHENTICATION ROUTES =============

// Register new user
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await dbRun(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, passwordHash, 'user']
    );

    const token = jwt.sign(
      { id, email, name, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    res.status(201).json({
      token,
      user: { id, name, email, role: 'user' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= USER ROUTES =============

// Get all users (public - for selection dropdown)
app.get('/api/users', async (req, res) => {
  try {
    const users = await dbAll('SELECT id, name, email, role FROM users ORDER BY name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin only)
app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { name, email, role } = req.body;
  const userId = req.params.id;

  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await dbRun(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name || user.name, email || user.email, role || user.role, userId]
    );

    const updatedUser = await dbGet(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json(updatedUser);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await dbRun('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change user password
app.post('/api/users/:id/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.params.id;

  // Users can only change their own password unless admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If not admin, verify current password
    if (req.user.role !== 'admin') {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required' });
      }

      const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await dbRun('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= DESK ROUTES =============

// Get all active desks
app.get('/api/desks', async (req, res) => {
  try {
    const desks = await dbAll('SELECT * FROM desks WHERE active = 1 ORDER BY id');
    res.json(desks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all desks including inactive (admin only)
app.get('/api/admin/desks', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const desks = await dbAll('SELECT * FROM desks ORDER BY id');
    res.json(desks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create desk (admin only)
app.post('/api/admin/desks', authenticateToken, requireAdmin, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Desk name is required' });
  }

  try {
    const result = await dbRun(
      'INSERT INTO desks (name, active) VALUES (?, ?)',
      [name, 1]
    );

    const desk = await dbGet('SELECT * FROM desks WHERE id = ?', [result.lastID]);
    res.status(201).json(desk);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update desk (admin only)
app.put('/api/admin/desks/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { name, active } = req.body;
  const deskId = req.params.id;

  try {
    const desk = await dbGet('SELECT * FROM desks WHERE id = ?', [deskId]);
    if (!desk) {
      return res.status(404).json({ error: 'Desk not found' });
    }

    await dbRun(
      'UPDATE desks SET name = ?, active = ? WHERE id = ?',
      [name !== undefined ? name : desk.name, active !== undefined ? active : desk.active, deskId]
    );

    const updatedDesk = await dbGet('SELECT * FROM desks WHERE id = ?', [deskId]);
    res.json(updatedDesk);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete desk (admin only) - soft delete by setting active = 0
app.delete('/api/admin/desks/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await dbRun('UPDATE desks SET active = 0 WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Desk not found' });
    }
    res.json({ message: 'Desk deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= BOOKING ROUTES =============

// Get all bookings (with optional date filter)
app.get('/api/bookings', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email, d.name as desk_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN desks d ON b.desk_id = d.id
      WHERE d.active = 1
    `;
    const params = [];

    if (date) {
      query += ' AND b.date = ?';
      params.push(date);
    } else if (startDate && endDate) {
      query += ' AND b.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY b.date, b.desk_id';

    const bookings = await dbAll(query, params);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  const { user_id, desk_id, date } = req.body;

  if (!user_id || !desk_id || !date) {
    return res.status(400).json({ error: 'user_id, desk_id, and date are required' });
  }

  try {
    // Check if user is admin (admins cannot book desks)
    const user = await dbGet('SELECT role FROM users WHERE id = ?', [user_id]);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Administrators cannot book desks. Please create a regular user account.' });
    }

    // Check if desk exists and is active
    const desk = await dbGet('SELECT * FROM desks WHERE id = ? AND active = 1', [desk_id]);
    if (!desk) {
      return res.status(400).json({ error: 'Desk not found or inactive' });
    }

    // Check if desk is already booked for that date
    const existing = await dbGet(
      'SELECT * FROM bookings WHERE desk_id = ? AND date = ?',
      [desk_id, date]
    );

    if (existing) {
      return res.status(400).json({ error: 'Desk is already booked for this date' });
    }

    const id = uuidv4();
    await dbRun(
      'INSERT INTO bookings (id, user_id, desk_id, date) VALUES (?, ?, ?, ?)',
      [id, user_id, desk_id, date]
    );

    const booking = await dbGet(
      `SELECT b.*, u.name as user_name, u.email as user_email, d.name as desk_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN desks d ON b.desk_id = d.id
       WHERE b.id = ?`,
      [id]
    );

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= MEETING ROUTES =============

// Get all meetings (with optional date filter)
app.get('/api/meetings', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    let query = `
      SELECT m.*, u.name as created_by_name
      FROM meetings m
      JOIN users u ON m.created_by = u.id
    `;
    const params = [];

    if (date) {
      query += ' WHERE m.date = ?';
      params.push(date);
    } else if (startDate && endDate) {
      query += ' WHERE m.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY m.date, m.time';

    const meetings = await dbAll(query, params);
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new meeting
app.post('/api/meetings', async (req, res) => {
  const { title, description, date, time, created_by } = req.body;

  if (!title || !date || !time || !created_by) {
    return res.status(400).json({ error: 'title, date, time, and created_by are required' });
  }

  try {
    // Check if user is admin (admins cannot create meetings as regular users)
    const user = await dbGet('SELECT role FROM users WHERE id = ?', [created_by]);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Administrators cannot create meetings as users. Please create a regular user account.' });
    }

    const id = uuidv4();
    await dbRun(
      'INSERT INTO meetings (id, title, description, date, time, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title, description || '', date, time, created_by]
    );

    const meeting = await dbGet(
      `SELECT m.*, u.name as created_by_name
       FROM meetings m
       JOIN users u ON m.created_by = u.id
       WHERE m.id = ?`,
      [id]
    );

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a meeting
app.delete('/api/meetings/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM meetings WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= WEEK TEMPLATE ROUTES =============

// Get user's templates
app.get('/api/templates', authenticateToken, async (req, res) => {
  try {
    const templates = await dbAll(
      'SELECT * FROM week_templates WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // Get template days for each template
    for (let template of templates) {
      const days = await dbAll(
        `SELECT td.*, d.name as desk_name
         FROM template_days td
         LEFT JOIN desks d ON td.desk_id = d.id
         WHERE td.template_id = ?
         ORDER BY td.day_of_week`,
        [template.id]
      );
      template.days = days;
    }

    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new template
app.post('/api/templates', authenticateToken, async (req, res) => {
  const { name, days } = req.body;

  if (!name || !days || !Array.isArray(days)) {
    return res.status(400).json({ error: 'name and days array are required' });
  }

  // Check if user is admin (admins cannot create templates)
  if (req.user.role === 'admin') {
    return res.status(403).json({ error: 'Administrators cannot create templates. Please create a regular user account.' });
  }

  try {
    const templateId = uuidv4();
    await dbRun(
      'INSERT INTO week_templates (id, user_id, name) VALUES (?, ?, ?)',
      [templateId, req.user.id, name]
    );

    // Insert template days
    for (let day of days) {
      const dayId = uuidv4();
      await dbRun(
        'INSERT INTO template_days (id, template_id, day_of_week, desk_id) VALUES (?, ?, ?, ?)',
        [dayId, templateId, day.day_of_week, day.desk_id || null]
      );
    }

    // Get the created template with days
    const template = await dbGet(
      'SELECT * FROM week_templates WHERE id = ?',
      [templateId]
    );

    const templateDays = await dbAll(
      `SELECT td.*, d.name as desk_name
       FROM template_days td
       LEFT JOIN desks d ON td.desk_id = d.id
       WHERE td.template_id = ?
       ORDER BY td.day_of_week`,
      [templateId]
    );

    template.days = templateDays;

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply template to date range
app.post('/api/templates/:id/apply', authenticateToken, async (req, res) => {
  const { startDate, endDate, deskId } = req.body;
  const templateId = req.params.id;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  try {
    // Get template
    const template = await dbGet(
      'SELECT * FROM week_templates WHERE id = ? AND user_id = ?',
      [templateId, req.user.id]
    );

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Get template days
    const templateDays = await dbAll(
      'SELECT * FROM template_days WHERE template_id = ?',
      [templateId]
    );

    // Generate bookings for date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const bookings = [];
    const errors = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Check if this day is in template
      const templateDay = templateDays.find(td => td.day_of_week === dayOfWeek);

      if (templateDay) {
        const dateStr = date.toISOString().split('T')[0];
        const bookingDeskId = deskId || templateDay.desk_id;

        if (!bookingDeskId) {
          errors.push({ date: dateStr, error: 'No desk specified' });
          continue;
        }

        // Check if already booked
        const existing = await dbGet(
          'SELECT * FROM bookings WHERE desk_id = ? AND date = ?',
          [bookingDeskId, dateStr]
        );

        if (existing) {
          errors.push({ date: dateStr, error: 'Desk already booked' });
          continue;
        }

        // Create booking
        const bookingId = uuidv4();
        await dbRun(
          'INSERT INTO bookings (id, user_id, desk_id, date) VALUES (?, ?, ?, ?)',
          [bookingId, req.user.id, bookingDeskId, dateStr]
        );

        bookings.push({ id: bookingId, date: dateStr, desk_id: bookingDeskId });
      }
    }

    res.json({
      message: 'Template applied',
      bookingsCreated: bookings.length,
      bookings,
      errors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a template
app.delete('/api/templates/:id', authenticateToken, async (req, res) => {
  try {
    const template = await dbGet(
      'SELECT * FROM week_templates WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Delete template days first
    await dbRun('DELETE FROM template_days WHERE template_id = ?', [req.params.id]);

    // Delete template
    await dbRun('DELETE FROM week_templates WHERE id = ?', [req.params.id]);

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= SERVER =============

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; // Export for testing
