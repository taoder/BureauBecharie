const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'coworking.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Desks table (5 desks)
  db.run(`
    CREATE TABLE IF NOT EXISTS desks (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);

  // Bookings table
  db.run(`
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
  db.run(`
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

  // Initialize 5 desks if they don't exist
  db.get('SELECT COUNT(*) as count FROM desks', (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare('INSERT INTO desks (id, name) VALUES (?, ?)');
      for (let i = 1; i <= 5; i++) {
        stmt.run(i, `Desk ${i}`);
      }
      stmt.finalize();
      console.log('Initialized 5 desks');
    }
  });
});

module.exports = db;
