import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'app.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'viewer' CHECK(role IN ('admin', 'editor', 'viewer')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS document_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      content TEXT NOT NULL,
      edited_by INTEGER REFERENCES users(id),
      version INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create default admin user if none exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)'
    ).run('admin', hash, 'admin');
  }
}
