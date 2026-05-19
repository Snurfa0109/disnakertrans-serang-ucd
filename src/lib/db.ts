import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'sqlite.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

// ─── MIGRATION HELPER ────────────────────────────────────────
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

// ─── NEWS TABLE ───────────────────────────────────────────────
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

// Migrate news table — add new columns to existing table
addColumnIfNotExists('news', 'slug', "TEXT");
addColumnIfNotExists('news', 'summary', "TEXT");
addColumnIfNotExists('news', 'category', "TEXT DEFAULT 'Umum'");
addColumnIfNotExists('news', 'source_url', "TEXT");
addColumnIfNotExists('news', 'source_name', "TEXT DEFAULT 'Disnakertrans Kab. Serang'");
addColumnIfNotExists('news', 'link_url', "TEXT");
addColumnIfNotExists('news', 'created_at', "TEXT DEFAULT (datetime('now'))");
addColumnIfNotExists('news', 'updated_at', "TEXT DEFAULT (datetime('now'))");

// Create indexes AFTER migrations ensure columns exist
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
    message TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);

// Migrate pengaduan table — add new columns to existing table
addColumnIfNotExists('pengaduan', 'subject', "TEXT DEFAULT ''");
addColumnIfNotExists('pengaduan', 'type', "TEXT DEFAULT 'umum'");
addColumnIfNotExists('pengaduan', 'status', "TEXT DEFAULT 'pending'");
addColumnIfNotExists('pengaduan', 'attachments', "TEXT DEFAULT '[]'");
addColumnIfNotExists('pengaduan', 'is_spam', "INTEGER DEFAULT 0");
addColumnIfNotExists('pengaduan', 'created_at', "TEXT DEFAULT (datetime('now'))");
addColumnIfNotExists('pengaduan', 'updated_at', "TEXT DEFAULT (datetime('now'))");

// Create indexes AFTER migrations
db.exec(`CREATE INDEX IF NOT EXISTS idx_pengaduan_status ON pengaduan(status)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_pengaduan_type ON pengaduan(type)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_pengaduan_date ON pengaduan(date DESC)`);

// ─── JADWAL PELATIHAN TABLE ──────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS jadwal_pelatihan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    time_start TEXT NOT NULL DEFAULT '08:00',
    time_end TEXT DEFAULT 'Selesai',
    color TEXT DEFAULT 'bg-green-500',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

// ─── STATISTIK TABLE ─────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS statistik (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

// Seed default statistik data if empty
const statCount = (db.prepare('SELECT COUNT(*) as c FROM statistik').get() as any)?.c || 0;
if (statCount === 0) {
  const seedStats = db.prepare(`INSERT OR IGNORE INTO statistik (key, label, value, description, sort_order) VALUES (?, ?, ?, ?, ?)`);
  seedStats.run('umk_serang', 'UMK Kabupaten Serang 2026', 'Rp 5.178.521', 'Naik 6,6% dari tahun 2025', 1);
  seedStats.run('ump_banten', 'UMP Banten 2026', 'Rp 5.067.381', 'Naik 6,5% dari tahun 2025', 2);
  seedStats.run('perusahaan_terdaftar', 'Perusahaan Terdaftar', '1.892', 'Perusahaan', 3);
  seedStats.run('pencari_kerja', 'Pencari Kerja Terdaftar', '12.402', 'Orang', 4);
  seedStats.run('lowongan_tersedia', 'Lowongan Tersedia (2025)', '3.150', 'Lowongan', 5);
}

// ─── VISITOR COUNTER TABLE ────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    UNIQUE(date)
  )
`);

// ─── VISITOR LOGS TABLE (detailed analytics) ──────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS visitor_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    ip_address TEXT DEFAULT '',
    device TEXT DEFAULT 'Desktop',
    browser TEXT DEFAULT 'Unknown',
    os TEXT DEFAULT 'Unknown',
    page_path TEXT NOT NULL DEFAULT '/',
    referrer TEXT DEFAULT '',
    city TEXT DEFAULT '',
    session_duration INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`CREATE INDEX IF NOT EXISTS idx_visitor_logs_date ON visitor_logs(created_at)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_visitor_logs_page ON visitor_logs(page_path)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_visitor_logs_vid ON visitor_logs(visitor_id)`);

export default db;
