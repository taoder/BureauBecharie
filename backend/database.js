require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'coworking.db');
const db = new sqlite3.Database(dbPath);

// Promisify database operations
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

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize database tables
const initializeDatabase = async () => {
  await new Promise((resolve) => {
    db.serialize(async () => {
      try {
        // Users table with authentication
        await dbRun(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Check if password_hash and role columns exist (for migration)
        const tableInfo = await dbAll("PRAGMA table_info(users)");
        const hasPasswordHash = tableInfo.some(col => col.name === 'password_hash');
        const hasRole = tableInfo.some(col => col.name === 'role');

        if (!hasPasswordHash) {
          console.log('Migrating users table: adding password_hash column');
          await dbRun('ALTER TABLE users ADD COLUMN password_hash TEXT');
        }

        if (!hasRole) {
          console.log('Migrating users table: adding role column');
          await dbRun("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
        }

        // Desks table
        await dbRun(`
          CREATE TABLE IF NOT EXISTS desks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Check if active column exists
        const deskTableInfo = await dbAll("PRAGMA table_info(desks)");
        const hasActive = deskTableInfo.some(col => col.name === 'active');

        if (!hasActive) {
          console.log('Migrating desks table: adding active column');
          await dbRun('ALTER TABLE desks ADD COLUMN active INTEGER DEFAULT 1');
        }

        // Bookings table
        await dbRun(`
          CREATE TABLE IF NOT EXISTS bookings (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            desk_id INTEGER NOT NULL,
            date DATE NOT NULL,
            status TEXT DEFAULT 'confirmed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (desk_id) REFERENCES desks(id)
          )
        `);

        // Meetings table
        await dbRun(`
          CREATE TABLE IF NOT EXISTS meetings (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            date DATE NOT NULL,
            time TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
          )
        `);

        // Week templates table (for recurring booking patterns)
        await dbRun(`
          CREATE TABLE IF NOT EXISTS week_templates (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
        `);

        // Template days table (which days/desks in the template)
        await dbRun(`
          CREATE TABLE IF NOT EXISTS template_days (
            id TEXT PRIMARY KEY,
            template_id TEXT NOT NULL,
            day_of_week INTEGER NOT NULL,
            desk_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (template_id) REFERENCES week_templates(id),
            FOREIGN KEY (desk_id) REFERENCES desks(id)
          )
        `);

        // Initialize 5 desks if they don't exist
        const deskCount = await dbGet('SELECT COUNT(*) as count FROM desks');
        if (deskCount && deskCount.count === 0) {
          const stmt = db.prepare('INSERT INTO desks (name, active) VALUES (?, ?)');
          for (let i = 1; i <= 5; i++) {
            stmt.run(`Desk ${i}`, 1);
          }
          stmt.finalize();
          console.log('✓ Initialized 5 desks');
        }

        // Create admin user if doesn't exist
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@coworking.local';
        const existingAdmin = await dbGet('SELECT * FROM users WHERE email = ?', [adminEmail]);

        if (!existingAdmin) {
          const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
          const adminName = process.env.ADMIN_NAME || 'Administrator';
          const { v4: uuidv4 } = require('uuid');
          const passwordHash = await bcrypt.hash(adminPassword, 10);

          await dbRun(
            'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), adminName, adminEmail, passwordHash, 'admin']
          );

          console.log('✓ Admin user created');
          console.log(`  Email: ${adminEmail}`);
          console.log(`  Password: ${adminPassword}`);
          console.log('  ⚠️  CHANGE THE PASSWORD IN PRODUCTION!');
        }

        console.log('✓ Database initialized successfully');
      } catch (error) {
        console.error('Database initialization error:', error);
      }
      resolve();
    });
  });
};

// Initialize on module load
initializeDatabase();

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll
};
