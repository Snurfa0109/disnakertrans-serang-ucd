/**
 * Database — MySQL connection via mysql2
 *
 * Exports a singleton `sql` tagged-template client.
 * Also exports `initDb()` to create tables + seed data on first run.
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// ─── CONNECTION POOL ──────────────────────────────────────────────
const globalForDb = globalThis as unknown as {
  connPool: mysql.Pool | undefined;
};

const pool =
  globalForDb.connPool ??
  mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'disnakertrans',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.connPool = pool;

/**
 * Tagged-template SQL helper — mimics postgres.js API.
 *
 * Usage:  const rows = await sql`SELECT * FROM news`
 *         const rows = await sql`SELECT * FROM news WHERE id = ${id}`
 */
async function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  // Build query string: replace ${} with ? placeholders
  let query = '';
  const params: any[] = [];
  strings.forEach((str, i) => {
    query += str;
    if (i < values.length) {
      const val = values[i];
      // Handle raw SQL fragments
      if (val && typeof val === 'object' && val.__raw) {
        query += val.__raw;
      } else {
        query += '?';
        params.push(val);
      }
    }
  });

  const [result] = await pool.execute(query, params);

  // For SELECT → return rows array; for INSERT/UPDATE/DELETE → return result with affectedRows etc.
  if (Array.isArray(result)) {
    return result as any[];
  }
  // Wrap result object as array-like so it's iterable but also has affectedRows
  const wrapper: any = [];
  Object.assign(wrapper, result);
  return wrapper;
}

interface SqlTag {
  (strings: TemplateStringsArray, ...values: any[]): Promise<any>;
  unsafe(query: string, params?: any[]): Promise<any>;
  begin(cb: (tx: any) => Promise<any>): Promise<any>;
}

const sqlTag: SqlTag = Object.assign(sql, {
  unsafe: async function (query: string, params: any[] = []): Promise<any[]> {
    let mysqlQuery = query.replace(/\$\d+/g, '?');
    mysqlQuery = mysqlQuery.replace(/\bILIKE\b/g, 'LIKE');

    const [result] = await pool.execute(mysqlQuery, params);

    if (Array.isArray(result)) {
      return result as any[];
    }
    const wrapper: any = [];
    Object.assign(wrapper, result);
    return wrapper;
  },
  begin: async function (cb: (tx: any) => Promise<any>): Promise<any> {
    return cb(sqlTag);
  }
});

export default sqlTag;

// â”€â”€â”€ INIT (run once at startup via instrumentation.ts) â”€â”€â”€â”€â”€â”€â”€â”€
export async function initDb(): Promise<void> {

  // â”€â”€ NEWS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS news (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      title         TEXT NOT NULL,
      description   TEXT NOT NULL,
      content       LONGTEXT,
      thumbnail     TEXT,
      date          TEXT NOT NULL,
      slug          TEXT,
      summary       TEXT,
      category      TEXT DEFAULT 'Umum',
      source_url    TEXT,
      source_name   TEXT DEFAULT 'Disnakertrans Kab. Serang',
      link_url      TEXT,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // â”€â”€ PENGADUAN TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS pengaduan (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      name            TEXT NOT NULL,
      email           TEXT NOT NULL,
      message         TEXT NOT NULL,
      date            TEXT NOT NULL,
      subject         TEXT DEFAULT '',
      type            TEXT DEFAULT 'umum',
      status          TEXT DEFAULT 'Baru',
      ticket_number   TEXT DEFAULT '',
      assigned_to     INTEGER DEFAULT NULL,
      internal_notes  TEXT DEFAULT '',
      attachments     TEXT DEFAULT '[]',
      is_spam         TINYINT(1) DEFAULT 0,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // ── JADWAL PELATIHAN TABLE ───────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS jadwal_pelatihan (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      title       TEXT NOT NULL,
      location    TEXT NOT NULL,
      date        TEXT NOT NULL,
      time_start  TEXT NOT NULL DEFAULT '08:00',
      time_end    TEXT DEFAULT 'Selesai',
      color       TEXT DEFAULT 'bg-green-500',
      cover_image TEXT,
      source_url  TEXT,
      is_active   TINYINT(1) DEFAULT 1,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  try {
    await sql`ALTER TABLE jadwal_pelatihan ADD COLUMN cover_image TEXT`;
  } catch {}
  try {
    await sql`ALTER TABLE jadwal_pelatihan ADD COLUMN source_url TEXT`;
  } catch {}

  // ── LOWONGAN KERJA TABLE ──────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS lowongan (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      title         TEXT NOT NULL,
      company       TEXT NOT NULL,
      location      TEXT DEFAULT 'Kabupaten Serang',
      job_type      TEXT DEFAULT 'Full time',
      education     TEXT DEFAULT 'SMA/SMK',
      deadline      TEXT DEFAULT '',
      salary        TEXT DEFAULT '',
      category      TEXT DEFAULT 'Dalam Negeri',
      logo_url      TEXT DEFAULT '',
      source_url    VARCHAR(255) DEFAULT 'https://karirhub.kemnaker.go.id/lowongan-dalam-negeri/lowongan',
      is_active     TINYINT(1) DEFAULT 1,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  try {
    await sql`ALTER TABLE lowongan ADD COLUMN category TEXT`;
  } catch {}
  try {
    await sql`ALTER TABLE lowongan ADD COLUMN salary TEXT`;
  } catch {}

  // ── DOKUMEN PUBLIK TABLE ──────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS dokumen_publik (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      title       TEXT NOT NULL,
      category    VARCHAR(100) DEFAULT 'LAPORAN KINERJA',
      description TEXT DEFAULT '',
      file_url    TEXT NOT NULL,
      file_size   VARCHAR(50) DEFAULT 'PDF',
      date        VARCHAR(50) DEFAULT '2026',
      sort_order  INTEGER DEFAULT 0,
      is_active   TINYINT(1) DEFAULT 1,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // ── EVENTS TABLE ──────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      title         TEXT NOT NULL,
      location      TEXT NOT NULL,
      date          TEXT NOT NULL,
      time_start    TEXT DEFAULT '08:00',
      time_end      TEXT DEFAULT 'Selesai',
      organizer     TEXT DEFAULT 'Disnakertrans Kab. Serang',
      link_url      TEXT DEFAULT '',
      is_active     TINYINT(1) DEFAULT 1,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // â”€â”€ STATISTIK TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS statistik (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      \`key\`       VARCHAR(191) NOT NULL UNIQUE,
      label       TEXT NOT NULL,
      value       TEXT NOT NULL,
      description TEXT DEFAULT '',
      sort_order  INTEGER DEFAULT 0,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // Seed statistik
  const statCount = await sql`SELECT COUNT(*) AS c FROM statistik`;
  if (Number(statCount[0].c) === 0) {
    await sql`
      INSERT IGNORE INTO statistik (\`key\`, label, value, description, sort_order) VALUES
        ('umk_serang',          'UMK Kabupaten Serang 2026', 'Rp 5.178.521', 'Naik 6,6% dari tahun 2025', 1),
        ('ump_banten',          'UMP Banten 2026',           'Rp 5.067.381', 'Naik 6,5% dari tahun 2025', 2),
        ('perusahaan_terdaftar','Perusahaan Terdaftar',      '3.047',         'Perusahaan',                 3),
        ('pencari_kerja',       'Pencari Kerja Terdaftar',   '9.702',        'Orang (L: 4.307 | P: 5.395)', 4),
        ('lowongan_tersedia',   'Lowongan Tersedia (2025)',  '3.150',         'Lowongan',                   5)
    `;
  }

  // â”€â”€ VISITORS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS visitors (
      id    INT AUTO_INCREMENT PRIMARY KEY,
      date  VARCHAR(20) NOT NULL UNIQUE,
      count INTEGER DEFAULT 0
    )
  `;

  // â”€â”€ VISITOR LOGS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS visitor_logs (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      visitor_id       TEXT NOT NULL,
      ip_address       TEXT DEFAULT '',
      device           TEXT DEFAULT 'Desktop',
      browser          TEXT DEFAULT 'Unknown',
      os               TEXT DEFAULT 'Unknown',
      page_path        TEXT NOT NULL DEFAULT '/',
      referrer         TEXT DEFAULT '',
      city             TEXT DEFAULT '',
      session_duration INTEGER DEFAULT 0,
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // â”€â”€ ADMIN USERS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         VARCHAR(191) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'website',
      is_active     TINYINT(1) DEFAULT 1,
      last_login    DATETIME DEFAULT NULL,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // â”€â”€ ADMIN SESSIONS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INTEGER NOT NULL,
      token       VARCHAR(191) NOT NULL UNIQUE,
      ip_address  TEXT DEFAULT '',
      expires_at  DATETIME NOT NULL,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // â”€â”€ AUDIT LOGS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id                 INT AUTO_INCREMENT PRIMARY KEY,
      actor_id           INTEGER,
      actor_name         TEXT NOT NULL DEFAULT 'System',
      actor_role         TEXT NOT NULL DEFAULT 'system',
      action             TEXT NOT NULL,
      module             TEXT NOT NULL,
      target_id          TEXT DEFAULT NULL,
      target_description TEXT DEFAULT NULL,
      ip_address         TEXT DEFAULT '',
      created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // â”€â”€ FAQS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS faqs (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      question    TEXT NOT NULL,
      answer      TEXT NOT NULL,
      category    TEXT NOT NULL DEFAULT 'Umum',
      status      TEXT NOT NULL DEFAULT 'draft',
      sort_order  INTEGER DEFAULT 0,
      created_by  INTEGER DEFAULT NULL,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // Seed FAQs
  const faqCount = await sql`SELECT COUNT(*) AS c FROM faqs`;
  if (Number(faqCount[0].c) === 0) {
    await sql`
      INSERT INTO faqs (question, answer, category, status, sort_order) VALUES
        ('Apa itu kartu AK1?', 'Kartu AK1 (Antar Kerja Lokal) adalah kartu tanda pencari kerja yang diterbitkan oleh Dinas Tenaga Kerja. Kartu ini wajib dimiliki sebagai syarat melamar pekerjaan secara resmi.', 'AK1', 'published', 1),
        ('Bagaimana cara membuat kartu AK1?', 'Untuk membuat kartu AK1, Anda perlu: 1) Datang ke kantor Disnakertrans Kab. Serang, 2) Membawa KTP, ijazah terakhir, dan pas foto 3x4, 3) Mengisi formulir permohonan, 4) Kartu akan diterbitkan saat itu juga.', 'AK1', 'published', 2),
        ('Bagaimana cara mengajukan pengaduan hubungan industrial?', 'Pengaduan hubungan industrial dapat diajukan melalui: 1) Portal online di website ini (menu Pengaduan), 2) Datang langsung ke kantor Bidang HI Jamsostek, 3) Melalui email resmi instansi.', 'Pengaduan', 'published', 3),
        ('Apakah ada pelatihan kerja gratis?', 'Ya, Disnakertrans Kab. Serang menyediakan program pelatihan kerja gratis melalui BLK (Balai Latihan Kerja). Jadwal pelatihan dapat dilihat di halaman Informasi Publik.', 'Pelatihan', 'published', 4),
        ('Berapa UMK Kabupaten Serang tahun 2026?', 'UMK Kabupaten Serang tahun 2026 adalah Rp 5.178.521 per bulan, naik 6,6% dari tahun 2025.', 'Umum', 'published', 5)
    `;
  }

  // â”€â”€ TUTORIALS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS tutorials (
      id                 INT AUTO_INCREMENT PRIMARY KEY,
      title              TEXT NOT NULL,
      slug               VARCHAR(191) NOT NULL UNIQUE,
      category           TEXT NOT NULL DEFAULT 'Umum',
      thumbnail          TEXT DEFAULT NULL,
      steps              LONGTEXT NOT NULL DEFAULT '[]',
      estimated_duration TEXT DEFAULT '5 menit',
      cta_link           TEXT DEFAULT NULL,
      cta_text           TEXT DEFAULT 'Mulai Sekarang',
      status             TEXT NOT NULL DEFAULT 'draft',
      created_by         INTEGER DEFAULT NULL,
      created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // Seed tutorials
  const tutorialCount = await sql`SELECT COUNT(*) AS c FROM tutorials`;
  if (Number(tutorialCount[0].c) === 0) {
    const ak1Steps = JSON.stringify([
      { title: 'Persiapkan Dokumen', content: 'Siapkan KTP asli dan fotokopi, ijazah terakhir (asli dan fotokopi), pas foto ukuran 3x4 (2 lembar), dan surat keterangan dari kelurahan (jika diperlukan).' },
      { title: 'Datang ke Kantor Disnakertrans', content: 'Kunjungi kantor Disnakertrans Kabupaten Serang di Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas. Buka Seninâ€“Jumat pukul 08.00â€“15.00 WIB.' },
      { title: 'Ambil Nomor Antrian', content: 'Setelah sampai, ambil nomor antrian di loket pelayanan AK1 dan tunggu dipanggil oleh petugas.' },
      { title: 'Isi Formulir Permohonan', content: 'Isi formulir permohonan kartu AK1 dengan data diri yang lengkap dan benar. Pastikan semua kolom terisi.' },
      { title: 'Serahkan Berkas', content: 'Serahkan formulir beserta dokumen persyaratan kepada petugas. Petugas akan memverifikasi kelengkapan berkas Anda.' },
      { title: 'Terima Kartu AK1', content: 'Setelah verifikasi selesai, kartu AK1 akan dicetak dan diserahkan kepada Anda saat itu juga. Simpan kartu ini dengan baik.' },
    ]);
    const pengaduanSteps = JSON.stringify([
      { title: 'Buka Halaman Pengaduan', content: 'Klik menu "Pengaduan" di navigasi utama website atau akses langsung di /pengaduan.' },
      { title: 'Pilih Jenis Pengaduan', content: 'Pilih jenis pengaduan sesuai permasalahan Anda: Pengaduan Umum atau Pengaduan Hubungan Industrial.' },
      { title: 'Isi Formulir Pengaduan', content: 'Isi data diri (nama, email) dan tuliskan isi pengaduan dengan jelas dan detail. Sertakan bukti/lampiran jika ada.' },
      { title: 'Submit Pengaduan', content: 'Klik tombol "Kirim Pengaduan". Sistem akan otomatis menghasilkan nomor tiket pengaduan untuk Anda.' },
      { title: 'Cek Email Konfirmasi', content: 'Periksa email Anda untuk mendapatkan konfirmasi nomor tiket dan informasi tindak lanjut pengaduan.' },
      { title: 'Pantau Status Pengaduan', content: 'Pengaduan Anda akan ditindaklanjuti dalam 3Ã—24 jam hari kerja. Balasan akan dikirimkan ke email yang Anda daftarkan.' },
    ]);
    const lowonganSteps = JSON.stringify([
      { title: 'Buat Kartu AK1', content: 'Pastikan Anda memiliki kartu AK1 (kartu pencari kerja) sebagai syarat utama melamar kerja secara resmi.' },
      { title: 'Buka Halaman Informasi Publik', content: 'Akses halaman Informasi Publik di website untuk melihat daftar lowongan kerja yang tersedia.' },
      { title: 'Cari Lowongan Sesuai Keahlian', content: 'Telusuri daftar lowongan berdasarkan bidang pekerjaan, kualifikasi pendidikan, atau lokasi penempatan.' },
      { title: 'Persiapkan Berkas Lamaran', content: 'Siapkan CV, surat lamaran, fotokopi ijazah, KTP, kartu AK1, dan pas foto terbaru.' },
      { title: 'Ajukan Lamaran', content: 'Kirim lamaran ke perusahaan sesuai petunjuk yang tertera di info lowongan, atau melalui Disnakertrans.' },
    ]);
    await sql`
      INSERT INTO tutorials (title, slug, category, steps, estimated_duration, cta_link, cta_text, status) VALUES
        ('Cara Membuat Kartu AK1',       'cara-membuat-kartu-ak1',       'AK1',           ${ak1Steps},       '30 menit', '/pengaduan',       'Hubungi Kami',    'published'),
        ('Cara Mengajukan Pengaduan',    'cara-mengajukan-pengaduan',    'Pengaduan',      ${pengaduanSteps}, '10 menit', '/pengaduan',       'Ajukan Pengaduan','published'),
        ('Cara Mencari Lowongan Kerja',  'cara-mencari-lowongan-kerja',  'Lowongan Kerja', ${lowonganSteps},  '15 menit', '/informasi-publik','Lihat Lowongan',  'published')
    `;
  }

  // â”€â”€ SITE CONTENT TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      \`key\`      VARCHAR(191) NOT NULL UNIQUE,
      label      TEXT NOT NULL,
      value      TEXT NOT NULL DEFAULT '',
      type       TEXT NOT NULL DEFAULT 'text',
      section    TEXT NOT NULL DEFAULT 'general',
      updated_by INTEGER DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // Seed site content
  const contentCount = await sql`SELECT COUNT(*) AS c FROM site_content`;
  if (Number(contentCount[0].c) === 0) {
    await sql`
      INSERT IGNORE INTO site_content (\`key\`, label, value, type, section) VALUES
        ('hero_title',         'Hero Title',              'Layanan Terpadu Disnakertrans Kabupaten Serang',       'text',     'hero'),
        ('hero_subtitle',      'Hero Subtitle',           'Melayani dengan profesional dan berintegritas untuk kesejahteraan tenaga kerja dan masyarakat Kabupaten Serang.', 'textarea', 'hero'),
        ('hero_cta_text',      'Hero CTA Button Text',    'Lihat Layanan',                                        'text',     'hero'),
        ('hero_cta_link',      'Hero CTA Button Link',    '/layanan-publik',                                      'text',     'hero'),
        ('sambutan_name',      'Nama Kepala Dinas',       'H. Hudaya, S.H., M.H.',                               'text',     'sambutan'),
        ('sambutan_title',     'Jabatan Kepala Dinas',    'Kepala Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang', 'text', 'sambutan'),
        ('sambutan_text',      'Teks Sambutan',           'Selamat datang di portal resmi Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang. Kami berkomitmen untuk memberikan pelayanan terbaik kepada seluruh masyarakat Kabupaten Serang dalam bidang ketenagakerjaan dan transmigrasi.', 'textarea', 'sambutan'),
        ('sambutan_photo',     'Foto Kepala Dinas',       '',                                                     'image',    'sambutan'),
        ('profil_description', 'Deskripsi Profil Instansi','Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang adalah instansi pemerintah daerah yang bertugas menyelenggarakan urusan pemerintahan di bidang ketenagakerjaan dan transmigrasi.', 'textarea', 'profil'),
        ('contact_address',    'Alamat Kantor',           'Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas, Kabupaten Serang, Banten 42182', 'textarea', 'contact'),
        ('contact_phone',      'Nomor Telepon',           '(0254) 200234',                                        'text',     'contact'),
        ('contact_email',      'Email Instansi',          'disnakertrans@serangkab.go.id',                        'text',     'contact'),
        ('contact_hours',      'Jam Operasional',         'Senin â€“ Jumat: 08.00 â€“ 15.00 WIB',                    'text',     'contact'),
        ('social_instagram',   'Instagram',               'https://instagram.com/disnakertrans_serang',           'url',      'social'),
        ('social_youtube',     'YouTube',                 '',                                                     'url',      'social'),
        ('social_facebook',    'Facebook',                '',                                                     'url',      'social'),
        ('social_twitter',     'Twitter/X',               '',                                                     'url',      'social'),
        ('portal_lapor',       'Link Portal LAPOR!',      'https://lapor.go.id',                                  'url',      'portals'),
        ('portal_sipp',        'Link Portal SIPP',        'https://sipp.naker.go.id',                             'url',      'portals'),
        ('portal_sisnaker',    'Link Portal SISNAKER',    'https://sisnaker.go.id',                               'url',      'portals'),
        ('portal_loker',       'Link Portal Loker',       'https://karirhub.kemnaker.go.id',                      'url',      'portals')
    `;
  }

  // â”€â”€ MEDIA LIBRARY TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS media_library (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      filename      VARCHAR(191) NOT NULL UNIQUE,
      original_name TEXT NOT NULL,
      file_type     TEXT NOT NULL DEFAULT 'image',
      mime_type     TEXT DEFAULT '',
      size_bytes    INTEGER DEFAULT 0,
      category      TEXT DEFAULT 'Umum',
      url           TEXT NOT NULL,
      uploaded_by   INTEGER DEFAULT NULL,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // â”€â”€ CHATBOT LOGS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await sql`
    CREATE TABLE IF NOT EXISTS chatbot_logs (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      session_id     TEXT NOT NULL,
      messages       LONGTEXT NOT NULL DEFAULT '[]',
      message_count  INTEGER DEFAULT 0,
      fallback_count INTEGER DEFAULT 0,
      last_query     TEXT DEFAULT '',
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // â”€â”€ SEED ADMIN USERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const adminCount = await sql`SELECT COUNT(*) AS c FROM admin_users`;
  if (Number(adminCount[0].c) === 0) {
    const demoAccounts = [
      { name: 'Super Admin',       email: 'superadmin@disnakertrans.go.id',   password: 'SuperAdmin123!',    role: 'superadmin' },
      { name: 'Admin Website',     email: 'website@disnakertrans.go.id',      password: 'Website123!',       role: 'website' },
      { name: 'Admin Sekretariat', email: 'sekretariat@disnakertrans.go.id',  password: 'Sekretariat123!',   role: 'sekretariat' },
      { name: 'Admin Lattas',      email: 'lattas@disnakertrans.go.id',       password: 'Lattas123!',        role: 'lattas' },
      { name: 'Admin Binapenta',   email: 'binapenta@disnakertrans.go.id',    password: 'Binapenta123!',     role: 'binapenta' },
      { name: 'Admin HI Jamsostek',email: 'hijamsostek@disnakertrans.go.id', password: 'HIJamsostek123!',   role: 'hijamsostek' },
    ];

    for (const account of demoAccounts) {
      const hash = bcrypt.hashSync(account.password, 12);
      await sql`
        INSERT IGNORE INTO admin_users (name, email, password_hash, role, is_active)
        VALUES (${account.name}, ${account.email}, ${hash}, ${account.role}, 1)
      `;
    }
    console.log('[DB] Seeded 6 demo admin accounts');
  }

  console.log('[DB] initDb complete');
}
