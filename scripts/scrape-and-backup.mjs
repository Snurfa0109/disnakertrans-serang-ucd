import mysql from 'mysql2/promise';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'disnakertrans',
  waitForConnections: true,
  connectionLimit: 5,
};

const BASE_URL = 'https://disnakertrans.serangkab.go.id';
const NEWS_LIST_URL = `${BASE_URL}/berita`;
const SOURCE_NAME = 'Disnakertrans Kab. Serang';
const BACKUP_FILE = path.resolve(process.cwd(), 'scripts/news-backup.json');

const MONTH_MAP = {
  januari: '01', februari: '02', maret: '03', april: '04',
  mei: '05', juni: '06', juli: '07', agustus: '08',
  september: '09', oktober: '10', november: '11', desember: '12'
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseIndonesianDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  const parts = dateStr.toLowerCase().trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0].replace(/\D/g, '').padStart(2, '0');
    const month = MONTH_MAP[parts[1]] || '01';
    const year = parts[2];
    if (day && month && year) {
      return `${year}-${month}-${day}T00:00:00.000Z`;
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 191);
}

function generateSummary(text, maxLen = 200) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const t = clean.substring(0, maxLen);
  const ls = t.lastIndexOf(' ');
  return ls > 0 ? t.substring(0, ls) + '...' : t + '...';
}

function resolveUrl(href) {
  if (!href) return '';
  if (href.startsWith('http')) return href;
  return `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
}

async function fetchHTML(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function scrapeListPage(page = 1) {
  const url = page === 1 ? NEWS_LIST_URL : `${NEWS_LIST_URL}?page=${page}`;
  console.log(`[Scraper] Mengambil listing halaman ${page}: ${url}`);
  const html = await fetchHTML(url);
  const $ = cheerio.load(html);
  const items = [];

  $('.card').each((_, el) => {
    const $card = $(el);
    const $link = $card.find('a[href*="/baca/berita/"]').first();
    const href = $link.attr('href') || '';
    if (!href) return;

    const source_url = resolveUrl(href);
    if (items.some(i => i.source_url === source_url)) return;

    let title = $card.find('.card-title, h5').first().text().trim().replace(/\s+/g, ' ');
    if (!title || title.length < 5 || title.toLowerCase() === 'administrator') {
      title = $card.find('a[href*="/baca/berita/"]').last().text().trim().replace(/\s+/g, ' ');
    }
    if (!title || title.length < 5) return;

    let category = 'Umum';
    const cat = $card.find('.c_ategory a, .category a, .badge').first().text().trim();
    if (cat && cat.length < 60) category = cat;

    let date = new Date().toISOString();
    const dateText = $card.find('.auther_post .txt p, time').first().text().trim();
    if (dateText) date = parseIndonesianDate(dateText);

    let thumbnail = '';
    const img = $card.find('img.main_img, img').first().attr('src') || '';
    if (img && !img.includes('team-2.png')) thumbnail = resolveUrl(img);

    items.push({ title, date, category, source_url, thumbnail });
  });

  const hasNext = $('a:contains("Next")').length > 0 ||
                  $('a[rel="next"]').length > 0 ||
                  $('li.page-item.active').next('li.page-item').find('a').length > 0;

  return { items, hasNext };
}

async function scrapeDetailPage(url) {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    let thumbnail = '';
    const $grid = $('.grid_blog_avatar.list_style').first();
    const cover = $grid.find('.cover_blog img').attr('src') || $grid.find('.cover_blog img').attr('data-src') || '';
    if (cover && !cover.includes('team-2.png')) thumbnail = resolveUrl(cover);
    if (!thumbnail) {
      const og = $('meta[property="og:image"]').attr('content') || '';
      if (og) thumbnail = resolveUrl(og);
    }

    let date = '';
    const $time = $('.body_blog.text-justify time, .body_blog time').first();
    if ($time.length) {
      const raw = ($time.attr('datetime') || $time.text()).trim().split('|')[0].trim();
      date = parseIndonesianDate(raw);
    }

    let title = '';
    for (const sel of ['.body_blog.text-justify .txt h4.title_blog', '.body_blog .txt h4.title_blog', 'h4.title_blog', 'h1']) {
      const t = $(sel).first().text().trim().replace(/\s+/g, ' ');
      if (t.length > 5) { title = t; break; }
    }

    const paragraphs = [];
    $('.body_blog.text-justify p').each((_, p) => {
      const $p = $(p);
      if ($p.closest('.person, .SSmedia, blockquote').length) return;
      const t = $p.text().trim().replace(/\s+/g, ' ');
      if (t.length > 15 && !t.includes('©') && !t.includes('Powered by')) paragraphs.push(t);
    });

    let content = paragraphs.join('\n\n');
    if (!content || content.length < 30) {
      $('header, nav, footer, script, style').remove();
      const ps = [];
      $('p').each((_, p) => {
        const t = $(p).text().trim().replace(/\s+/g, ' ');
        if (t.length > 20 && !t.includes('©')) ps.push(t);
      });
      content = ps.join('\n\n');
    }

    return { title, content, thumbnail, date };
  } catch (err) {
    console.warn(`[Scraper] Gagal detail ${url}:`, err.message);
    return { title: '', content: '', thumbnail: '', date: '' };
  }
}

async function main() {
  const maxPages = parseInt(process.argv[2] || '6', 10);
  console.log(`=== Memulai Scraping Berita Disnakertrans (${maxPages} halaman) ===`);

  const pool = mysql.createPool(DB_CONFIG);

  try {
    // 1. Ambil URL yang sudah ada di DB
    const [existing] = await pool.execute('SELECT source_url FROM news WHERE source_url IS NOT NULL');
    const existingUrls = new Set(existing.map(r => r.source_url));
    console.log(`Berita saat ini di database: ${existing.length}`);

    let addedCount = 0;

    for (let page = 1; page <= maxPages; page++) {
      const { items, hasNext } = await scrapeListPage(page);
      console.log(`Halaman ${page}: Menemukan ${items.length} berita`);

      for (const item of items) {
        if (existingUrls.has(item.source_url)) {
          console.log(`[Lewati Duplikat] ${item.title.substring(0, 40)}...`);
          continue;
        }

        await sleep(1500); // Sopan pada server sumber
        const detail = await scrapeDetailPage(item.source_url);

        const title = detail.title || item.title;
        const plain = (detail.content || title).replace(/<[^>]*>/g, '');
        const article = {
          title,
          slug: generateSlug(title),
          description: generateSummary(plain, 160),
          summary: generateSummary(plain, 250),
          content: detail.content || title,
          thumbnail: detail.thumbnail || item.thumbnail || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800',
          category: item.category || 'Umum',
          source_url: item.source_url,
          source_name: SOURCE_NAME,
          date: detail.date || item.date || new Date().toISOString(),
        };

        try {
          await pool.execute(
            `INSERT INTO news (title, slug, description, summary, content, thumbnail, category, source_url, source_name, date, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              article.title, article.slug, article.description, article.summary,
              article.content, article.thumbnail, article.category, article.source_url,
              article.source_name, article.date
            ]
          );
          existingUrls.add(article.source_url);
          addedCount++;
          console.log(`✓ [${addedCount}] Berhasil ditambah: ${article.title.substring(0, 50)}`);
        } catch (err) {
          console.error(`✗ Gagal simpan ke DB: ${article.title.substring(0, 30)} -`, err.message);
        }
      }

      if (!hasNext || page >= maxPages) break;
      await sleep(1500);
    }

    // 2. Buat backup JSON semua berita di DB ke file permanen
    const [allDbNews] = await pool.execute(
      'SELECT id, title, slug, description, summary, content, thumbnail, category, source_url, source_name, date FROM news ORDER BY id ASC'
    );
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(allDbNews, null, 2), 'utf8');
    console.log(`\n======================================================`);
    console.log(`✓ SELESAI! Ditambahkan: ${addedCount} berita baru.`);
    console.log(`✓ Total berita sekarang di DB: ${allDbNews.length}`);
    console.log(`✓ File backup permanen disimpan di: ${BACKUP_FILE}`);
    console.log(`======================================================\n`);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
