/**
 * News Scraper Service
 *
 * Scrapes news from https://disnakertrans.serangkab.go.id/berita
 * Handles pagination, deduplication, content extraction, and cleanup.
 *
 * HTML Structure (verified via live inspection):
 *   List page:   .card-body .about_post .c_ategory a  → category
 *                a[href*="/baca/berita/"] h5           → title
 *   Detail page: .cover_blog img                      → thumbnail
 *                h4.title_blog                        → title
 *                .body_blog .person time              → date
 *                .body_blog.text-justify p            → article paragraphs
 */

import * as cheerio from 'cheerio';
import sql from '@/lib/db';
import cache from '@/lib/cache';
import {
  generateSlug,
  generateSummary,
  cleanContent,
  parseIndonesianDate,
  getCategoryFallbackImage,
} from '@/lib/utils';

const BASE_URL = 'https://disnakertrans.serangkab.go.id';
const NEWS_LIST_URL = `${BASE_URL}/berita`;
const SOURCE_NAME = 'Disnakertrans Kab. Serang';

// Delay between requests to be polite to the source server
const REQUEST_DELAY_MS = 1500;

interface ScrapedArticle {
  title: string;
  slug: string;
  description: string;
  summary: string;
  content: string;
  thumbnail: string;
  category: string;
  source_url: string;
  source_name: string;
  date: string;
}

/**
 * Sleep utility for delay between requests
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch HTML from a URL with error handling and timeout.
 */
async function fetchHTML(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Resolve a potentially relative URL to an absolute URL.
 */
function resolveUrl(href: string): string {
  if (!href) return '';
  if (href.startsWith('http')) return href;
  return `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
}

/**
 * Scrape the news listing page to extract article links and basic metadata.
 */
async function scrapeNewsListPage(page = 1): Promise<{
  articles: { title: string; date: string; category: string; source_url: string; thumbnail: string }[];
  hasNextPage: boolean;
}> {
  const url = page === 1 ? NEWS_LIST_URL : `${NEWS_LIST_URL}?page=${page}`;
  console.log(`[Scraper] Fetching listing page ${page}: ${url}`);

  const html = await fetchHTML(url);
  const $ = cheerio.load(html);

  const articles: { title: string; date: string; category: string; source_url: string; thumbnail: string }[] = [];

  // Each news card in HTML is a .card containing links to /baca/berita/
  $('.card').each((_, cardEl) => {
    const $card = $(cardEl);
    const $link = $card.find('a[href*="/baca/berita/"]').first();
    const href = $link.attr('href') || '';
    if (!href) return;

    const source_url = resolveUrl(href);

    // Skip duplicate URLs in this batch
    if (articles.some((a) => a.source_url === source_url)) return;

    // Title: h5.card-title or explicit link title
    let title = $card.find('.card-title, h5').first().text().trim().replace(/\s+/g, ' ');
    if (!title || title.length < 5 || title.toLowerCase() === 'administrator') {
      title = $card.find('a[href*="/baca/berita/"]').last().text().trim().replace(/\s+/g, ' ');
    }

    if (!title || title.length < 5) return;

    // Category
    let category = 'Umum';
    const catText = $card.find('.c_ategory a, .category a, .badge').first().text().trim();
    if (catText && catText.length < 60) {
      category = catText;
    }

    // Date: look for date string inside author info
    let date = new Date().toISOString();
    const dateText = $card.find('.auther_post .txt p, time').first().text().trim();
    if (dateText) {
      date = parseIndonesianDate(dateText);
    }

    // Thumbnail: main image in the card
    let thumbnail = '';
    const imgSrc = $card.find('img.main_img, img').first().attr('src') || '';
    if (imgSrc && !imgSrc.includes('team-2.png')) {
      thumbnail = resolveUrl(imgSrc);
    }

    articles.push({ title, date, category, source_url, thumbnail });
  });

  // Check for next page link
  const hasNextPage =
    $('a:contains("Next")').length > 0 ||
    $('a[rel="next"]').length > 0 ||
    $('li.page-item.active').next('li.page-item').find('a').length > 0;

  console.log(`[Scraper] Found ${articles.length} articles on page ${page}`);
  return { articles, hasNextPage };
}

/**
 * Scrape a single article detail page for full content.
 * Verified HTML structure:
 *   .body_blog.text-justify
 *     └ a.href="#" > .person.media   ← author card (skip)
 *     └ div.txt > h4.title_blog      ← title
 *     └ p                            ← article paragraphs (direct children)
 *     └ p ...
 *   .cover_blog > img                ← thumbnail
 */
async function scrapeArticleDetail(url: string): Promise<{
  content: string;
  thumbnail: string;
  date: string;
  category: string;
  title: string;
}> {
  console.log(`[Scraper] Fetching article detail: ${url}`);

  const html = await fetchHTML(url);
  const $ = cheerio.load(html);

  // ── THUMBNAIL ──────────────────────────────────────────────
  let thumbnail = '';
  const $firstGrid = $('.grid_blog_avatar.list_style').first();
  const coverSrc = $firstGrid.find('.cover_blog img').attr('src') ||
                   $firstGrid.find('.cover_blog img').attr('data-src') || '';
  if (coverSrc && !coverSrc.includes('team-2.png')) {
    thumbnail = resolveUrl(coverSrc);
  }

  if (!thumbnail) {
    const ogImg = $('meta[property="og:image"]').attr('content') || '';
    if (ogImg) thumbnail = resolveUrl(ogImg);
  }

  // ── DATE ───────────────────────────────────────────────────
  let date = '';
  const $timeEl = $('.body_blog.text-justify time, .body_blog time').first();
  if ($timeEl.length) {
    const rawDate = ($timeEl.attr('datetime') || $timeEl.text()).trim();
    const cleanDate = rawDate.split('|')[0].trim();
    date = parseIndonesianDate(cleanDate);
  }
  if (!date) {
    const bodyText = $('body').text();
    const dateMatch = bodyText.match(/(\d{1,2}\s+\w+\s+\d{4})/);
    if (dateMatch) date = parseIndonesianDate(dateMatch[1]);
  }

  // ── TITLE ──────────────────────────────────────────────────
  let title = '';
  const titleCandidates = [
    '.body_blog.text-justify .txt h4.title_blog',
    '.body_blog .txt h4.title_blog',
    'h4.title_blog',
    'h1',
    'h2',
  ];
  for (const sel of titleCandidates) {
    const text = $(sel).first().text().trim().replace(/\s+/g, ' ');
    if (text.length > 5) { title = text; break; }
  }

  // ── CONTENT ────────────────────────────────────────────────
  let content = '';
  const $contentEl = $('.body_blog.text-justify').first();
  if ($contentEl.length) {
    const paragraphs: string[] = [];

    $contentEl.find('p').each((_, p) => {
      const $p = $(p);
      if ($p.closest('.person, .SSmedia, blockquote.instagram-media').length) return;

      const text = $p.text().trim().replace(/\s+/g, ' ');
      if (
        text.length > 15 &&
        !text.toLowerCase().includes('a post shared by') &&
        !text.toLowerCase().includes('view this post on instagram') &&
        !text.toLowerCase().includes('temukan berita terbaru') &&
        !text.includes('©') &&
        !text.includes('Powered by')
      ) {
        paragraphs.push(text);
      }
    });

    if (paragraphs.length > 0) {
      content = paragraphs.join('\n\n');
    } else {
      $contentEl.find('.person, .SSmedia, a[href="#"], script, style').remove();
      const rawText = $contentEl.text().trim().replace(/\s+/g, ' ');
      if (rawText.length > 50) content = rawText;
    }
  }

  if (!content || content.length < 30) {
    $('header, nav, footer, .navbar, .sidebar, .col-lg-4, .col-md-4, script, style').remove();
    const paragraphs: string[] = [];
    $('p').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (
        text.length > 20 &&
        !text.toLowerCase().includes('a post shared by') &&
        !text.toLowerCase().includes('view this post on instagram') &&
        !text.toLowerCase().includes('temukan berita terbaru') &&
        !text.includes('©') &&
        !text.includes('Copyright') &&
        !text.includes('Powered by')
      ) {
        paragraphs.push(text);
      }
    });
    content = paragraphs.join('\n\n');
  }

  content = cleanContent(content);

  return { content, thumbnail, date, category: 'Umum', title };
}

/**
 * Check if an article already exists in the database by source_url.
 */
async function articleExists(sourceUrl: string): Promise<boolean> {
  const rows = await sql`SELECT id FROM news WHERE source_url = ${sourceUrl} LIMIT 1`;
  return rows.length > 0;
}

/**
 * Insert a scraped article into the database.
 */
async function insertArticle(article: ScrapedArticle): Promise<void> {
  await sql`
    INSERT INTO news (title, slug, description, summary, content, thumbnail, category, source_url, source_name, date, created_at, updated_at)
    VALUES (
      ${article.title}, ${article.slug}, ${article.description}, ${article.summary},
      ${article.content}, ${article.thumbnail}, ${article.category},
      ${article.source_url}, ${article.source_name}, ${article.date},
      NOW(), NOW()
    )
  `;
}

/**
 * Main scraper function — orchestrates the full scraping pipeline.
 *
 * @param maxPages - Maximum number of listing pages to scrape (default: 2)
 * @returns The number of new articles added
 */
export async function scrapeNews(maxPages = 2): Promise<{
  newArticles: number;
  totalScraped: number;
  errors: string[];
}> {
  console.log(`[Scraper] Starting news scrape at ${new Date().toISOString()}`);

  let newArticles = 0;
  let totalScraped = 0;
  const errors: string[] = [];

  try {
    for (let page = 1; page <= maxPages; page++) {
      const { articles, hasNextPage } = await scrapeNewsListPage(page);

      for (const article of articles) {
        totalScraped++;

        try {
          // Skip if already in database (deduplication by source_url)
          if (await articleExists(article.source_url)) {
            console.log(`[Scraper] Skipping duplicate: ${article.title}`);
            continue;
          }

          // Delay between requests
          await sleep(REQUEST_DELAY_MS);

          // Fetch the full article content
          const detail = await scrapeArticleDetail(article.source_url);

          // Build the full article object
          const articleTitle = detail.title || article.title;
          const plainContent = detail.content.replace(/<[^>]*>/g, '');

          const articleCategory = article.category || detail.category || 'Umum';
          const fullArticle: ScrapedArticle = {
            title: articleTitle,
            slug: generateSlug(articleTitle),
            description: generateSummary(plainContent, 160),
            summary: generateSummary(plainContent, 250),
            content: detail.content || article.title,
            thumbnail: detail.thumbnail || article.thumbnail || getCategoryFallbackImage(articleCategory),
            category: articleCategory,
            source_url: article.source_url,
            source_name: SOURCE_NAME,
            date: article.date || detail.date,
          };

          // Insert into database
          await insertArticle(fullArticle);
          newArticles++;
          console.log(`[Scraper] ✓ Added: ${fullArticle.title}`);
        } catch (error) {
          const msg = `Failed to scrape: ${article.title} — ${error instanceof Error ? error.message : String(error)}`;
          console.error(`[Scraper] ✗ ${msg}`);
          errors.push(msg);
        }
      }

      // Stop if no more pages
      if (!hasNextPage || page >= maxPages) break;

      // Delay before fetching next page
      await sleep(REQUEST_DELAY_MS);
    }
  } catch (error) {
    const msg = `Scraper pipeline error: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`[Scraper] ✗ ${msg}`);
    errors.push(msg);
  }

  // Invalidate cache after new data
  if (newArticles > 0) {
    cache.invalidateByPrefix('news:');
    console.log(`[Scraper] Cache invalidated after adding ${newArticles} new articles`);
  }

  console.log(`[Scraper] Complete — ${newArticles} new, ${totalScraped} total scanned, ${errors.length} errors`);

  return { newArticles, totalScraped, errors };
}

/**
 * Scrape job vacancies from KarirHub Kemnaker (Banten Province) & SISKOP2MI BP2MI (Luar Negeri)
 */
export async function scrapeLowongan(): Promise<{ count: number; errors: string[] }> {
  console.log('[Scraper] Fetching domestic job vacancies from KarirHub Kemnaker (Banten Province)');
  const errors: string[] = [];
  let count = 0;

  // 1. Fetch live Domestic Jobs from KarirHub Kemnaker (Banten Province)
  try {
    const appId = 'FBT7DBIQJ8';
    const apiKey = 'alps_765d4cb775b917a5937ef9e20218b5e5300e4d9045bcb914';
    const kemnakerAlgoliaUrl = 'https://api.algolia.kemnaker.go.id/1/indexes/*/queries';
    const bantenUuid = '3165c146-2174-4ab7-91e9-948fc4ef97ea';

    const body = {
      requests: [
        {
          indexName: 'karirhub_industrial_vacancies',
          params: `query=&facetFilters=${encodeURIComponent(JSON.stringify([[`locations:province:${bantenUuid}`]]))}&hitsPerPage=50`
        }
      ]
    };

    const res = await fetch(kemnakerAlgoliaUrl, {
      method: 'POST',
      headers: {
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      const hits = data.results?.[0]?.hits || [];
      console.log(`[Scraper] KarirHub Kemnaker API returned ${hits.length} Banten vacancies`);

      for (const h of hits) {
        const title = h.title || 'Lowongan Kerja';
        const company = h.company_name || 'Perusahaan Mitra KarirHub';
        const location = h.city_name ? `${h.city_name}, Banten` : 'Banten';
        const jobType = h.job_type_name || 'Full time';
        const education = 'SMA/SMK/D3/S1';

        let deadline = '2026-12-31';
        if (h.expires_at) {
          deadline = new Date(h.expires_at * 1000).toISOString().slice(0, 10);
        }

        let salary = 'Sesuai Kebijakan Perusahaan';
        if (h.show_salary && (h.min_salary_amount || h.max_salary_amount)) {
          const min = h.min_salary_amount ? 'Rp ' + Number(h.min_salary_amount).toLocaleString('id-ID') : '';
          const max = h.max_salary_amount ? 'Rp ' + Number(h.max_salary_amount).toLocaleString('id-ID') : '';
          salary = min && max ? `${min} - ${max}` : (min || max);
        }

        const logoUrl = h.company_logo_uri || '';
        const sourceUrl = `https://karirhub.kemnaker.go.id/lowongan-dalam-negeri/lowongan/${h.id}`;

        const existing = await sql`SELECT id FROM lowongan WHERE source_url = ${sourceUrl} OR (title = ${title} AND company = ${company} AND category = 'Dalam Negeri') LIMIT 1`;
        if (existing.length === 0) {
          await sql`
            INSERT INTO lowongan (title, company, location, job_type, education, deadline, salary, category, logo_url, source_url, is_active)
            VALUES (${title}, ${company}, ${location}, ${jobType}, ${education}, ${deadline}, ${salary}, 'Dalam Negeri', ${logoUrl}, ${sourceUrl}, 1)
          `;
          count++;
        } else {
          await sql`
            UPDATE lowongan
            SET title = ${title}, company = ${company}, location = ${location}, job_type = ${jobType}, education = ${education}, deadline = ${deadline}, salary = ${salary}, category = 'Dalam Negeri', logo_url = ${logoUrl}, source_url = ${sourceUrl}, is_active = 1
            WHERE id = ${existing[0].id}
          `;
        }
      }
    }
  } catch (err) {
    const msg = `KarirHub Kemnaker Lowongan Scraper error: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[Scraper] ✗ ${msg}`);
    errors.push(msg);
  }

  // 2. Fetch live International Jobs from SISKOP2MI BP2MI (https://siskop2mi.bp2mi.go.id/lowongan/list)
  try {
      const maxRecords = 30;
      const bp2miRecords: any[] = [];

      for (let offset = 0; offset < maxRecords; offset += 10) {
        const bp2miUrl = `https://siskop2mi.bp2mi.go.id/lowongan/load_sip_record/${offset}?jabatan=&negara=&sektor=&p3mi=&pendidikan=&urutan=1&berdasarkan=1`;
        const res = await fetch(bp2miUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://siskop2mi.bp2mi.go.id/lowongan/list',
          },
        });

        if (!res.ok) break;

        const data = await res.json();
        if (Array.isArray(data.result) && data.result.length > 0) {
          bp2miRecords.push(...data.result);
        } else {
          break;
        }
      }

      console.log(`[Scraper] Fetched ${bp2miRecords.length} overseas jobs from SISKOP2MI BP2MI`);

      for (const item of bp2miRecords) {
        const title = item.JABATAN || item.SUSAHA || 'Tenaga Kerja Luar Negeri';
        const company = item.P3MI || item.AGENCY || 'P3MI Terdaftar BP2MI';
        const country = item.NEGARA || 'Luar Negeri';
        const jobType = item.SKEMA ? `${item.SKEMA}` : 'P TO P';
        const education = item.PENDIDIKAN || item.PENDIDIKAN2 || 'SMA/SMK/Sederajat';
        const deadline = item.SIP_BERLAKUAKHIR || '2026-12-31';

        let salary = '';
        if (item.JOB_GAJI) {
          salary = `${item.JOB_GAJI}${item.JOB_GAJI_MAX ? ' - ' + item.JOB_GAJI_MAX : ''} ${item.MUANG || ''}`.trim();
        } else {
          salary = 'Sesuai Kontrak Kerja';
        }

        let logoUrl = '';
        if (item.P3MI_PROFILE) {
          logoUrl = item.P3MI_PROFILE.startsWith('http')
            ? item.P3MI_PROFILE
            : `https://siskop2mi.bp2mi.go.id${item.P3MI_PROFILE}`;
        } else if (item.NEGARA_ISO2) {
          logoUrl = `https://flagcdn.com/w80/${item.NEGARA_ISO2.toLowerCase()}.png`;
        } else {
          logoUrl = 'https://siskop2mi.bp2mi.go.id/assets/images/job-thumb-11.jpg';
        }

        const sourceUrl = `https://siskop2mi.bp2mi.go.id/lowongan/detail/${item.JS_ID}`;

        const existing = await sql`SELECT id FROM lowongan WHERE source_url = ${sourceUrl} OR (title = ${title} AND company = ${company} AND category = 'Luar Negeri') LIMIT 1`;
        if (existing.length === 0) {
          await sql`
            INSERT INTO lowongan (title, company, location, job_type, education, deadline, salary, category, logo_url, source_url, is_active)
            VALUES (${title}, ${company}, ${country}, ${jobType}, ${education}, ${deadline}, ${salary}, 'Luar Negeri', ${logoUrl}, ${sourceUrl}, 1)
          `;
          count++;
        } else {
          await sql`
            UPDATE lowongan
            SET title = ${title}, company = ${company}, location = ${country}, job_type = ${jobType}, education = ${education}, deadline = ${deadline}, salary = ${salary}, category = 'Luar Negeri', logo_url = ${logoUrl}, source_url = ${sourceUrl}, is_active = 1
            WHERE id = ${existing[0].id}
          `;
        }
      }

      console.log(`[Scraper] Scraped & updated ${bp2miRecords.length} overseas vacancies from SISKOP2MI BP2MI (${count} new inserted)`);
    } catch (err) {
      const msg = `SISKOP2MI BP2MI Scraper error: ${err instanceof Error ? err.message : String(err)}`;
      console.error(`[Scraper] ✗ ${msg}`);
      errors.push(msg);
    }

  return { count, errors };
}

/**
 * Scrape trainings from Kemnaker Skillhub (Banten Province filter) & Karir Serang
 */
export async function scrapeTrainings(): Promise<{ count: number; errors: string[] }> {
  console.log('[Scraper] Fetching trainings from Kemnaker Skillhub (Banten) & Karir Serang');
  const errors: string[] = [];
  let count = 0;

  // 1. Fetch live Banten training programs directly from Kemnaker Skillhub (Algolia API)
  try {
    const appId = 'FBT7DBIQJ8';
    const apiKey = 'alps_765d4cb775b917a5937ef9e20218b5e5300e4d9045bcb914';
    const kemnakerAlgoliaUrl = 'https://api.algolia.kemnaker.go.id/1/indexes/*/queries';
    // Banten Province UUID filter: 3165c146-2174-4ab7-91e9-948fc4ef97ea
    const bantenProvinceFilter = 'locations:province:3165c146-2174-4ab7-91e9-948fc4ef97ea';

    const body = {
      requests: [
        {
          indexName: 'skillhub_programs',
          params: `query=&facetFilters=${encodeURIComponent(JSON.stringify([[bantenProvinceFilter]]))}&hitsPerPage=100`
        }
      ]
    };

    const res = await fetch(kemnakerAlgoliaUrl, {
      method: 'POST',
      headers: {
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      const hits = data.results?.[0]?.hits || [];
      console.log(`[Scraper] Skillhub Kemnaker API returned ${hits.length} Banten trainings`);

      for (const hit of hits) {
        const title = hit.title || 'Pelatihan Vokasi Kemnaker';
        const vocationalName = hit.vocational_name || 'Pelatihan Vokasi';
        const subVocational = hit.sub_vocational_name ? ` - ${hit.sub_vocational_name}` : '';
        const cover_image = hit.cover_image_url || '';
        const source_url = `https://skillhub.kemnaker.go.id/pelatihan/${hit.id}`;
        const location = `BBPVP Serang / Banten (${vocationalName}${subVocational})`;
        const date = 'Tahun 2026';

        const existing = await sql`SELECT id FROM jadwal_pelatihan WHERE title = ${title} OR source_url = ${source_url} LIMIT 1`;
        if (existing.length === 0) {
          await sql`
            INSERT INTO jadwal_pelatihan (title, location, date, time_start, time_end, color, cover_image, source_url, is_active)
            VALUES (${title}, ${location}, ${date}, '08:00', '15:00', 'bg-emerald-500', ${cover_image}, ${source_url}, 1)
          `;
          count++;
        } else {
          await sql`
            UPDATE jadwal_pelatihan
            SET title = ${title}, location = ${location}, date = ${date}, cover_image = ${cover_image}, source_url = ${source_url}, is_active = 1
            WHERE id = ${existing[0].id}
          `;
        }
      }
    }
  } catch (err) {
    const msg = `Kemnaker Skillhub Scraper error: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[Scraper] ✗ ${msg}`);
    errors.push(msg);
  }

  // 2. Fetch trainings from Karir Serang
  try {
    const html = await fetchHTML('https://karir.serangkab.go.id/trainings');
    const $ = cheerio.load(html);

    const items: {
      title: string;
      location: string;
      date: string;
      cover_image: string;
      link_url: string;
    }[] = [];

    $('[wire\\:key*="training-"]').each((_, el) => {
      const $el = $(el);
      const title = $el.find('p.font-semibold, p.font-plus-jakarta').first().text().trim();
      const location = $el.find('p.text-\\[\\#64748B\\], p.text-slate-500').first().text().trim() || 'BBPVP Serang';
      const rawDate = $el.find('p.bg-\\[\\#FFFFFFE5\\], p.backdrop-blur').first().text().trim() || 'September 2026';
      const cover_image = $el.find('img').first().attr('src') || '';
      const link_url = $el.find('a[href*="kemnaker.go.id"]').attr('href') || 'https://karir.serangkab.go.id/trainings';

      if (title) {
        items.push({
          title,
          location,
          date: rawDate,
          cover_image,
          link_url,
        });
      }
    });

    for (const item of items) {
      const existing = await sql`SELECT id FROM jadwal_pelatihan WHERE title = ${item.title} OR source_url = ${item.link_url} LIMIT 1`;
      if (existing.length === 0) {
        await sql`
          INSERT INTO jadwal_pelatihan (title, location, date, time_start, time_end, color, cover_image, source_url, is_active)
          VALUES (${item.title}, ${item.location}, ${item.date}, '08:00', '15:00', 'bg-[#FBBF24]', ${item.cover_image}, ${item.link_url}, 1)
        `;
        count++;
      } else {
        await sql`
          UPDATE jadwal_pelatihan
          SET location = ${item.location}, date = ${item.date}, cover_image = ${item.cover_image}, source_url = ${item.link_url}, is_active = 1
          WHERE id = ${existing[0].id}
        `;
      }
    }

    console.log(`[Scraper] Scraped & updated ${items.length} trainings from Karir Serang (${count} new inserted)`);
  } catch (err) {
    const msg = `Karir Serang Trainings Scraper error: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[Scraper] ✗ ${msg}`);
    errors.push(msg);
  }

  return { count, errors };
}

/**
 * Scrape events from Kemnaker Job Fair (https://jobfair.kemnaker.go.id/web/events)
 */
export async function scrapeEvents(): Promise<{ count: number; errors: string[] }> {
  console.log('[Scraper] Fetching events from https://jobfair.kemnaker.go.id/web/events');
  const errors: string[] = [];
  let count = 0;

  try {
    const url = 'https://api.kemnaker.go.id/ebursa/v1/published-events?limit=50';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
        'Referer': 'https://jobfair.kemnaker.go.id/web/events',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status} from Kemnaker Job Fair events endpoint`);
    }

    const json = await res.json();
    const events = json.data || [];

    for (const ev of events) {
      const title = (ev.name || ev.title || 'Job Fair Kemnaker').trim();
      const organizer = (ev.organizer?.name || 'Kementerian Ketenagakerjaan RI').trim();

      const city = ev.city?.name || '';
      const province = ev.city?.province?.name || '';
      const venue = ev.venue_name || '';
      const locParts = [venue, city, province].filter(Boolean);
      const location = locParts.length > 0 ? locParts.join(', ') : 'Indonesia';

      const startDate = ev.start_date ? ev.start_date.slice(0, 10) : '';
      const endDate = ev.end_date ? ev.end_date.slice(0, 10) : '';
      const date = startDate && endDate ? `${startDate} s.d. ${endDate}` : (startDate || '2026');

      const timeStart = ev.start_hour ? ev.start_hour.slice(0, 5) : '08:00';
      const timeEnd = ev.end_hour ? ev.end_hour.slice(0, 5) : '16:00';
      const linkUrl = `https://jobfair.kemnaker.go.id/web/events/${ev.id}`;

      const existing = await sql`SELECT id FROM events WHERE link_url = ${linkUrl} OR title = ${title} LIMIT 1`;
      if (existing.length === 0) {
        await sql`
          INSERT INTO events (title, location, date, time_start, time_end, organizer, link_url, is_active)
          VALUES (${title}, ${location}, ${date}, ${timeStart}, ${timeEnd}, ${organizer}, ${linkUrl}, 1)
        `;
        count++;
      } else {
        await sql`
          UPDATE events
          SET title = ${title}, location = ${location}, date = ${date}, time_start = ${timeStart}, time_end = ${timeEnd}, organizer = ${organizer}, link_url = ${linkUrl}, is_active = 1
          WHERE id = ${existing[0].id}
        `;
      }
    }

    console.log(`[Scraper] Scraped & updated ${events.length} events from Kemnaker Job Fair (${count} new inserted)`);
  } catch (err) {
    const msg = `Kemnaker Job Fair Events Scraper error: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[Scraper] ✗ ${msg}`);
    errors.push(msg);
  }

  return { count, errors };
}

/**
 * Scrape official public documents from https://disnakertrans.serangkab.go.id/dokumen
 */
export async function scrapeDokumenPublik(): Promise<{ count: number; errors: string[] }> {
  console.log('[Scraper] Fetching public documents from https://disnakertrans.serangkab.go.id/search/document');
  const errors: string[] = [];
  let count = 0;

  try {
    const url = 'https://disnakertrans.serangkab.go.id/search/document?query=';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://disnakertrans.serangkab.go.id/dokumen',
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} from document search endpoint`);

    const data = await res.json();
    const $ = cheerio.load(`<table><tbody>${data.table_data}</tbody></table>`);
    const rows = $('tr').toArray();

    for (let i = 0; i < rows.length; i++) {
      const el = rows[i];
      const title = $(el).find('td').eq(0).text().trim();
      const href = $(el).find('a').attr('href') || '';

      if (!title || !href) continue;

      let category = 'LAPORAN KINERJA';
      let description = 'Dokumen resmi akuntabilitas dan transparansi program publik Disnakertrans.';
      let date = '2025';

      const titleUpper = title.toUpperCase();
      if (titleUpper.includes('KEPUASAN') || titleUpper.includes('IKM') || titleUpper.includes('SURVEI')) {
        category = 'SURVEI & KEPUASAN';
        description = 'Indeks kepuasan masyarakat terhadap mutu pelayanan publik ketenagakerjaan.';
      } else if (titleUpper.includes('RENJA')) {
        category = 'RENCANA KERJA';
        description = 'Rencana kerja tahunan dinas dalam penguatan pasar tenaga kerja dan pelatihan.';
      } else if (titleUpper.includes('PERJANJIAN KINERJA')) {
        category = 'PERJANJIAN KINERJA';
        description = 'Perjanjian penetapan target capaian kinerja unit perangkat daerah.';
      } else if (titleUpper.includes('INDIKATOR KINERJA') || titleUpper.includes('IKU')) {
        category = 'INDIKATOR KINERJA';
        description = 'Tolak ukur pencapaian Indikator Kinerja Utama (IKU) perangkat daerah.';
      } else if (titleUpper.includes('LKIP')) {
        category = 'LAPORAN KINERJA';
        description = 'Laporan Kinerja Instansi Pemerintah (LKIP) atas pelaksanaan program dan anggaran.';
      }

      const yearMatch = title.match(/202[0-9]/);
      if (yearMatch) date = yearMatch[0];

      const existing = await sql`SELECT id FROM dokumen_publik WHERE file_url = ${href} OR title = ${title} LIMIT 1`;
      if (existing.length === 0) {
        await sql`
          INSERT INTO dokumen_publik (title, category, description, file_url, file_size, date, sort_order, is_active)
          VALUES (${title}, ${category}, ${description}, ${href}, 'PDF', ${date}, ${i + 1}, 1)
        `;
        count++;
      } else {
        await sql`
          UPDATE dokumen_publik
          SET title = ${title}, category = ${category}, description = ${description}, file_url = ${href}, file_size = 'PDF', date = ${date}, sort_order = ${i + 1}, is_active = 1
          WHERE id = ${existing[0].id}
        `;
      }
    }

    console.log(`[Scraper] Scraped & updated ${rows.length} documents from Disnakertrans (${count} new inserted)`);
  } catch (err) {
    const msg = `Dokumen Scraper error: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[Scraper] ✗ ${msg}`);
    errors.push(msg);
  }

  return { count, errors };
}
