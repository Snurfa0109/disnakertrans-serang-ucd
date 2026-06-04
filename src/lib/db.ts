import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

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
addColumnIfNotExists('pengaduan', 'status', "TEXT DEFAULT 'Baru'");
addColumnIfNotExists('pengaduan', 'ticket_number', "TEXT DEFAULT ''");
addColumnIfNotExists('pengaduan', 'assigned_to', "INTEGER DEFAULT NULL");
addColumnIfNotExists('pengaduan', 'internal_notes', "TEXT DEFAULT ''");
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

// ─── ADMIN USERS TABLE ───────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'website',
    is_active INTEGER DEFAULT 1,
    last_login TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role)`);

// ─── ADMIN SESSIONS TABLE ─────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    ip_address TEXT DEFAULT '',
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
  )
`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(user_id)`);

// ─── AUDIT LOGS TABLE ─────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER,
    actor_name TEXT NOT NULL DEFAULT 'System',
    actor_role TEXT NOT NULL DEFAULT 'system',
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    target_id TEXT DEFAULT NULL,
    target_description TEXT DEFAULT NULL,
    ip_address TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )
`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at DESC)`);

// ─── FAQ TABLE ────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Umum',
    status TEXT NOT NULL DEFAULT 'draft',
    sort_order INTEGER DEFAULT 0,
    created_by INTEGER DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_faqs_status ON faqs(status)`);

// Seed default FAQs if empty
const faqCount = (db.prepare('SELECT COUNT(*) as c FROM faqs').get() as any)?.c || 0;
if (faqCount === 0) {
  const seedFaq = db.prepare(`INSERT INTO faqs (question, answer, category, status, sort_order) VALUES (?, ?, ?, 'published', ?)`);
  seedFaq.run('Apa itu kartu AK1?', 'Kartu AK1 (Antar Kerja Lokal) adalah kartu tanda pencari kerja yang diterbitkan oleh Dinas Tenaga Kerja. Kartu ini wajib dimiliki sebagai syarat melamar pekerjaan secara resmi.', 'AK1', 1);
  seedFaq.run('Bagaimana cara membuat kartu AK1?', 'Untuk membuat kartu AK1, Anda perlu: 1) Datang ke kantor Disnakertrans Kab. Serang, 2) Membawa KTP, ijazah terakhir, dan pas foto 3x4, 3) Mengisi formulir permohonan, 4) Kartu akan diterbitkan saat itu juga.', 'AK1', 2);
  seedFaq.run('Bagaimana cara mengajukan pengaduan hubungan industrial?', 'Pengaduan hubungan industrial dapat diajukan melalui: 1) Portal online di website ini (menu Pengaduan), 2) Datang langsung ke kantor Bidang HI Jamsostek, 3) Melalui email resmi instansi.', 'Pengaduan', 3);
  seedFaq.run('Apakah ada pelatihan kerja gratis?', 'Ya, Disnakertrans Kab. Serang menyediakan program pelatihan kerja gratis melalui BLK (Balai Latihan Kerja). Jadwal pelatihan dapat dilihat di halaman Informasi Publik.', 'Pelatihan', 4);
  seedFaq.run('Berapa UMK Kabupaten Serang tahun 2026?', 'UMK Kabupaten Serang tahun 2026 adalah Rp 5.178.521 per bulan, naik 6,6% dari tahun 2025.', 'Umum', 5);
}

// ─── TUTORIALS TABLE ──────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS tutorials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'Umum',
    thumbnail TEXT DEFAULT NULL,
    steps TEXT NOT NULL DEFAULT '[]',
    estimated_duration TEXT DEFAULT '5 menit',
    cta_link TEXT DEFAULT NULL,
    cta_text TEXT DEFAULT 'Mulai Sekarang',
    status TEXT NOT NULL DEFAULT 'draft',
    created_by INTEGER DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_tutorials_slug ON tutorials(slug)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_tutorials_status ON tutorials(status)`);

// Seed default tutorials if empty
const tutorialCount = (db.prepare('SELECT COUNT(*) as c FROM tutorials').get() as any)?.c || 0;
if (tutorialCount === 0) {
  const seedTutorial = db.prepare(`INSERT INTO tutorials (title, slug, category, steps, estimated_duration, cta_link, cta_text, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'published')`);
  const ak1Steps = JSON.stringify([
    { title: 'Persiapkan Dokumen', content: 'Siapkan KTP asli dan fotokopi, ijazah terakhir (asli dan fotokopi), pas foto ukuran 3x4 (2 lembar), dan surat keterangan dari kelurahan (jika diperlukan).' },
    { title: 'Datang ke Kantor Disnakertrans', content: 'Kunjungi kantor Disnakertrans Kabupaten Serang di Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas. Buka Senin–Jumat pukul 08.00–15.00 WIB.' },
    { title: 'Ambil Nomor Antrian', content: 'Setelah sampai, ambil nomor antrian di loket pelayanan AK1 dan tunggu dipanggil oleh petugas.' },
    { title: 'Isi Formulir Permohonan', content: 'Isi formulir permohonan kartu AK1 dengan data diri yang lengkap dan benar. Pastikan semua kolom terisi.' },
    { title: 'Serahkan Berkas', content: 'Serahkan formulir beserta dokumen persyaratan kepada petugas. Petugas akan memverifikasi kelengkapan berkas Anda.' },
    { title: 'Terima Kartu AK1', content: 'Setelah verifikasi selesai, kartu AK1 akan dicetak dan diserahkan kepada Anda saat itu juga. Simpan kartu ini dengan baik.' },
  ]);
  seedTutorial.run('Cara Membuat Kartu AK1', 'cara-membuat-kartu-ak1', 'AK1', ak1Steps, '30 menit', '/pengaduan', 'Hubungi Kami');

  const pengaduanSteps = JSON.stringify([
    { title: 'Buka Halaman Pengaduan', content: 'Klik menu "Pengaduan" di navigasi utama website atau akses langsung di /pengaduan.' },
    { title: 'Pilih Jenis Pengaduan', content: 'Pilih jenis pengaduan sesuai permasalahan Anda: Pengaduan Umum atau Pengaduan Hubungan Industrial.' },
    { title: 'Isi Formulir Pengaduan', content: 'Isi data diri (nama, email) dan tuliskan isi pengaduan dengan jelas dan detail. Sertakan bukti/lampiran jika ada.' },
    { title: 'Submit Pengaduan', content: 'Klik tombol "Kirim Pengaduan". Sistem akan otomatis menghasilkan nomor tiket pengaduan untuk Anda.' },
    { title: 'Cek Email Konfirmasi', content: 'Periksa email Anda untuk mendapatkan konfirmasi nomor tiket dan informasi tindak lanjut pengaduan.' },
    { title: 'Pantau Status Pengaduan', content: 'Pengaduan Anda akan ditindaklanjuti dalam 3×24 jam hari kerja. Balasan akan dikirimkan ke email yang Anda daftarkan.' },
  ]);
  seedTutorial.run('Cara Mengajukan Pengaduan', 'cara-mengajukan-pengaduan', 'Pengaduan', pengaduanSteps, '10 menit', '/pengaduan', 'Ajukan Pengaduan');

  const lowonganSteps = JSON.stringify([
    { title: 'Buat Kartu AK1', content: 'Pastikan Anda memiliki kartu AK1 (kartu pencari kerja) sebagai syarat utama melamar kerja secara resmi.' },
    { title: 'Buka Halaman Informasi Publik', content: 'Akses halaman Informasi Publik di website untuk melihat daftar lowongan kerja yang tersedia.' },
    { title: 'Cari Lowongan Sesuai Keahlian', content: 'Telusuri daftar lowongan berdasarkan bidang pekerjaan, kualifikasi pendidikan, atau lokasi penempatan.' },
    { title: 'Persiapkan Berkas Lamaran', content: 'Siapkan CV, surat lamaran, fotokopi ijazah, KTP, kartu AK1, dan pas foto terbaru.' },
    { title: 'Ajukan Lamaran', content: 'Kirim lamaran ke perusahaan sesuai petunjuk yang tertera di info lowongan, atau melalui Disnakertrans.' },
  ]);
  seedTutorial.run('Cara Mencari Lowongan Kerja', 'cara-mencari-lowongan-kerja', 'Lowongan Kerja', lowonganSteps, '15 menit', '/informasi-publik', 'Lihat Lowongan');
}

// ─── SITE CONTENT TABLE (CMS) ────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    value TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'text',
    section TEXT NOT NULL DEFAULT 'general',
    updated_by INTEGER DEFAULT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

// Seed default site content if empty
const contentCount = (db.prepare('SELECT COUNT(*) as c FROM site_content').get() as any)?.c || 0;
if (contentCount === 0) {
  const seedContent = db.prepare(`INSERT OR IGNORE INTO site_content (key, label, value, type, section) VALUES (?, ?, ?, ?, ?)`);
  seedContent.run('hero_title', 'Hero Title', 'Layanan Terpadu Disnakertrans Kabupaten Serang', 'text', 'hero');
  seedContent.run('hero_subtitle', 'Hero Subtitle', 'Melayani dengan profesional dan berintegritas untuk kesejahteraan tenaga kerja dan masyarakat Kabupaten Serang.', 'textarea', 'hero');
  seedContent.run('hero_cta_text', 'Hero CTA Button Text', 'Lihat Layanan', 'text', 'hero');
  seedContent.run('hero_cta_link', 'Hero CTA Button Link', '/layanan-publik', 'text', 'hero');
  seedContent.run('sambutan_name', 'Nama Kepala Dinas', 'H. Hudaya, S.H., M.H.', 'text', 'sambutan');
  seedContent.run('sambutan_title', 'Jabatan Kepala Dinas', 'Kepala Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang', 'text', 'sambutan');
  seedContent.run('sambutan_text', 'Teks Sambutan', 'Selamat datang di portal resmi Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang. Kami berkomitmen untuk memberikan pelayanan terbaik kepada seluruh masyarakat Kabupaten Serang dalam bidang ketenagakerjaan dan transmigrasi.', 'textarea', 'sambutan');
  seedContent.run('sambutan_photo', 'Foto Kepala Dinas', '', 'image', 'sambutan');
  seedContent.run('profil_description', 'Deskripsi Profil Instansi', 'Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang adalah instansi pemerintah daerah yang bertugas menyelenggarakan urusan pemerintahan di bidang ketenagakerjaan dan transmigrasi.', 'textarea', 'profil');
  seedContent.run('contact_address', 'Alamat Kantor', 'Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas, Kabupaten Serang, Banten 42182', 'textarea', 'contact');
  seedContent.run('contact_phone', 'Nomor Telepon', '(0254) 200234', 'text', 'contact');
  seedContent.run('contact_email', 'Email Instansi', 'disnakertrans@serangkab.go.id', 'text', 'contact');
  seedContent.run('contact_hours', 'Jam Operasional', 'Senin – Jumat: 08.00 – 15.00 WIB', 'text', 'contact');
  seedContent.run('social_instagram', 'Instagram', 'https://instagram.com/disnakertrans_serang', 'url', 'social');
  seedContent.run('social_youtube', 'YouTube', '', 'url', 'social');
  seedContent.run('social_facebook', 'Facebook', '', 'url', 'social');
  seedContent.run('social_twitter', 'Twitter/X', '', 'url', 'social');
  seedContent.run('portal_lapor', 'Link Portal LAPOR!', 'https://lapor.go.id', 'url', 'portals');
  seedContent.run('portal_sipp', 'Link Portal SIPP', 'https://sipp.naker.go.id', 'url', 'portals');
  seedContent.run('portal_sisnaker', 'Link Portal SISNAKER', 'https://sisnaker.go.id', 'url', 'portals');
  seedContent.run('portal_loker', 'Link Portal Loker', 'https://karirhub.kemnaker.go.id', 'url', 'portals');
}

// ─── MEDIA LIBRARY TABLE ─────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS media_library (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'image',
    mime_type TEXT DEFAULT '',
    size_bytes INTEGER DEFAULT 0,
    category TEXT DEFAULT 'Umum',
    url TEXT NOT NULL,
    uploaded_by INTEGER DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_media_library_type ON media_library(file_type)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category)`);

// ─── CHATBOT LOGS TABLE ───────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS chatbot_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    messages TEXT NOT NULL DEFAULT '[]',
    message_count INTEGER DEFAULT 0,
    fallback_count INTEGER DEFAULT 0,
    last_query TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_chatbot_logs_session ON chatbot_logs(session_id)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_chatbot_logs_date ON chatbot_logs(created_at DESC)`);

// ─── SEED ADMIN USERS ─────────────────────────────────────────
const adminCount = (db.prepare('SELECT COUNT(*) as c FROM admin_users').get() as any)?.c || 0;
if (adminCount === 0) {
  const demoAccounts = [
    { name: 'Super Admin', email: 'superadmin@disnakertrans.go.id', password: 'SuperAdmin123!', role: 'superadmin' },
    { name: 'Admin Website', email: 'website@disnakertrans.go.id', password: 'Website123!', role: 'website' },
    { name: 'Admin Sekretariat', email: 'sekretariat@disnakertrans.go.id', password: 'Sekretariat123!', role: 'sekretariat' },
    { name: 'Admin Lattas', email: 'lattas@disnakertrans.go.id', password: 'Lattas123!', role: 'lattas' },
    { name: 'Admin Binapenta', email: 'binapenta@disnakertrans.go.id', password: 'Binapenta123!', role: 'binapenta' },
    { name: 'Admin HI Jamsostek', email: 'hijamsostek@disnakertrans.go.id', password: 'HIJamsostek123!', role: 'hijamsostek' },
  ];

  const insertAdmin = db.prepare(`
    INSERT INTO admin_users (name, email, password_hash, role, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const account of demoAccounts) {
    const hash = bcrypt.hashSync(account.password, 12);
    insertAdmin.run(account.name, account.email, hash, account.role);
  }

  console.log('[DB] Seeded 6 demo admin accounts');
}

export default db;
