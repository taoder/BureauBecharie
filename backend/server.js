const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper function to promisify database queries
const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// ============= USER ROUTES =============

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await dbAll('SELECT * FROM users ORDER BY name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const id = uuidv4();
    await dbRun(
      'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
      [id, name, email]
    );
    res.status(201).json({ id, name, email });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= DESK ROUTES =============

// Get all desks
app.get('/api/desks', async (req, res) => {
  try {
    const desks = await dbAll('SELECT * FROM desks ORDER BY id');
    res.json(desks);
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
    `;
    const params = [];

    if (date) {
      query += ' WHERE b.date = ?';
      params.push(date);
    } else if (startDate && endDate) {
      query += ' WHERE b.date BETWEEN ? AND ?';
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

// ============= SERVER =============

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
