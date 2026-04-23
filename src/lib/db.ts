import Database from 'better-sqlite3';

const db = new Database('sqlite.db');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    thumbnail TEXT,
    date TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS pengaduan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);

export default db;
