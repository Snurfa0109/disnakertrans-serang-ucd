import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'sqlite.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

// ─── NEWS TABLE ───────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    thumbnail TEXT,
    category TEXT DEFAULT 'Umum',
    source_url TEXT UNIQUE,
    source_name TEXT DEFAULT 'Disnakertrans Kab. Serang',
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

// Create indexes for performance
db.exec(`CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_news_category ON news(category)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_news_source_url ON news(source_url)`);

// ─── PENGADUAN (COMPLAINTS) TABLE ─────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS pengaduan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT DEFAULT '',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processed')),
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`CREATE INDEX IF NOT EXISTS idx_pengaduan_status ON pengaduan(status)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_pengaduan_date ON pengaduan(date DESC)`);

// ─── MIGRATION: Add columns if missing (safe for existing DBs) ──
function addColumnIfNotExists(table: string, column: string, definition: string) {
  try {
    const info = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    const exists = info.some((col) => col.name === column);
    if (!exists) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  } catch {
    // Ignore errors silently
  }
}

// Migrate news table
addColumnIfNotExists('news', 'slug', "TEXT UNIQUE");
addColumnIfNotExists('news', 'summary', "TEXT");
addColumnIfNotExists('news', 'category', "TEXT DEFAULT 'Umum'");
addColumnIfNotExists('news', 'source_url', "TEXT UNIQUE");
addColumnIfNotExists('news', 'source_name', "TEXT DEFAULT 'Disnakertrans Kab. Serang'");
addColumnIfNotExists('news', 'created_at', "TEXT DEFAULT (datetime('now'))");
addColumnIfNotExists('news', 'updated_at', "TEXT DEFAULT (datetime('now'))");

// Migrate pengaduan table
addColumnIfNotExists('pengaduan', 'subject', "TEXT DEFAULT ''");
addColumnIfNotExists('pengaduan', 'status', "TEXT DEFAULT 'pending'");
addColumnIfNotExists('pengaduan', 'created_at', "TEXT DEFAULT (datetime('now'))");
addColumnIfNotExists('pengaduan', 'updated_at', "TEXT DEFAULT (datetime('now'))");

export default db;
