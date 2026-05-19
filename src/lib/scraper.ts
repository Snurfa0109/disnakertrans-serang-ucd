/**
 * News Scraper Service
 * 
 * Scrapes news from https://disnakertrans.serangkab.go.id/berita
 * Handles pagination, deduplication, content extraction, and cleanup.
 */

import * as cheerio from 'cheerio';
import db from '@/lib/db';
import cache from '@/lib/cache';
import {
  generateSlug,
  generateSummary,
  cleanContent,
  parseIndonesianDate,
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
        'User-Agent': 'DisnakertransSerang-NewsScraper/1.0',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
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

  // Each news card is inside a div/card structure with link to the article
  // Based on the site structure, news items are in cards with titles linking to /baca/berita/[slug]
  $('a[href*="/baca/berita/"]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    
    // Get the title text — look for h5/h4 headings inside or the main text
    const titleEl = $el.find('h5, h4, h3').first();
    const title = titleEl.text().trim();
    
    if (!title || !href) return;
    
    // Build the full URL
    const source_url = href.startsWith('http') ? href : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
    
    // Skip if we've already seen this URL in this batch
    if (articles.some((a) => a.source_url === source_url)) return;

    // Extract category from a badge/label near the card
    const categoryEl = $el.closest('.card, .col, [class*="col-"]').find('a[href*="/berita"], .badge, [class*="badge"]');
    let category = 'Umum';
    categoryEl.each((_, catEl) => {
      const catText = $(catEl).text().trim();
      if (catText && !catText.includes('Administrator') && catText.length < 50 && catText !== title) {
        category = catText;
      }
    });

    // Extract date from the text (e.g., "04 March 2026")
    const parentText = $el.closest('.card, .col, [class*="col-"]').text();
    const dateMatch = parentText.match(/(\d{1,2}\s+\w+\s+\d{4})/);
    const date = dateMatch ? parseIndonesianDate(dateMatch[1]) : new Date().toISOString();

    // Extract thumbnail image
    const imgEl = $el.find('img').first();
    let thumbnail = imgEl.attr('src') || '';
    if (thumbnail && !thumbnail.startsWith('http')) {
      thumbnail = `${BASE_URL}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}`;
    }

    articles.push({ title, date, category, source_url, thumbnail });
  });

  // Check for next page link
  const hasNextPage = $('a:contains("Next")').length > 0 || $('a[rel="next"]').length > 0;

  return { articles, hasNextPage };
}

/**
 * Scrape a single article detail page for full content.
 */
async function scrapeArticleDetail(url: string): Promise<{
  content: string;
  thumbnail: string;
  date: string;
  category: string;
}> {
  console.log(`[Scraper] Fetching article detail: ${url}`);

  const html = await fetchHTML(url);
  const $ = cheerio.load(html);

  // Extract the main article content
  // The content is typically in the main content area after the title
  let content = '';

  // Try common content selectors (including broader ones for various CMS themes)
  const contentSelectors = [
    '.article-content',
    '.news-content',
    '.post-content',
    '.entry-content',
    '.content-body',
    'article .content',
    '.card-body',
    '.detail-content',
    '.post-body',
    '.berita-content',
    '.single-content',
    '.page-content',
    'article',
    '.col-md-8',
    '.col-lg-8',
  ];

  for (const selector of contentSelectors) {
    const el = $(selector);
    if (el.length > 0) {
      // Extract text from paragraphs within the container
      const paragraphs: string[] = [];
      el.find('p').each((_, p) => {
        const text = $(p).text().trim();
        if (text.length > 20) {
          paragraphs.push(text);
        }
      });
      if (paragraphs.length > 0) {
        content = paragraphs.join('\n\n');
        break;
      }
      // If no paragraphs, try the raw text
      const rawText = el.text().trim();
      if (rawText.length > 100) {
        content = rawText;
        break;
      }
    }
  }

  // Fallback: collect ALL meaningful paragraphs from the page body
  if (!content || content.length < 50) {
    const paragraphs: string[] = [];
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      // Filter out nav items, footers, very short texts, and boilerplate
      if (
        text.length > 20 &&
        !text.includes('©') &&
        !text.includes('Copyright') &&
        !text.includes('Powered by') &&
        !text.includes('All rights reserved')
      ) {
        paragraphs.push(text);
      }
    });
    if (paragraphs.length > 0) {
      content = paragraphs.join('\n\n');
    }
  }

  // Final fallback: extract from the body, skipping header/nav/footer
  if (!content || content.length < 50) {
    $('header, nav, footer, script, style, .navbar, .sidebar, .footer').remove();
    const bodyText = $('body').text().trim().replace(/\s+/g, ' ');
    if (bodyText.length > 100) {
      content = bodyText.substring(0, 5000);
    }
  }

  // Clean the content
  content = cleanContent(content);

  // Extract thumbnail from the article page
  let thumbnail = '';
  const imgSelectors = [
    '.article-image img',
    '.post-image img',
    '.news-image img',
    'article img',
    '.card-img-top',
    'img[class*="featured"]',
    '.content img',
  ];

  for (const selector of imgSelectors) {
    const imgEl = $(selector).first();
    if (imgEl.length) {
      thumbnail = imgEl.attr('src') || '';
      if (thumbnail && !thumbnail.startsWith('http')) {
        thumbnail = `${BASE_URL}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}`;
      }
      break;
    }
  }

  // If no image found, try og:image meta tag
  if (!thumbnail) {
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      thumbnail = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;
    }
  }

  // Extract date from the detail page
  let date = '';
  const dateText = $('body').text();
  const dateMatch = dateText.match(/(\d{1,2}\s+\w+\s+\d{4})/);
  if (dateMatch) {
    date = parseIndonesianDate(dateMatch[1]);
  }

  // Extract category  
  let category = 'Umum';
  const categoryLinks = $('a[href*="/berita/kategori/"]');
  if (categoryLinks.length > 0) {
    category = categoryLinks.first().text().trim().replace(/\(all\)/i, '').trim() || 'Umum';
  }

  // Extract title from the detail page (more accurate than listing page)
  let title = '';
  const titleSelectors = ['h1', 'article h2', '.article-title', '.post-title', '.entry-title'];
  for (const sel of titleSelectors) {
    const titleEl = $(sel).first();
    if (titleEl.length && titleEl.text().trim().length > 5) {
      title = titleEl.text().trim();
      break;
    }
  }

  return { content, thumbnail, date, category, title };
}

/**
 * Check if an article already exists in the database by source_url.
 */
function articleExists(sourceUrl: string): boolean {
  const row = db.prepare('SELECT id FROM news WHERE source_url = ?').get(sourceUrl);
  return !!row;
}

/**
 * Insert a scraped article into the database.
 */
function insertArticle(article: ScrapedArticle): void {
  const stmt = db.prepare(`
    INSERT INTO news (title, slug, description, summary, content, thumbnail, category, source_url, source_name, date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  stmt.run(
    article.title,
    article.slug,
    article.description,
    article.summary,
    article.content,
    article.thumbnail,
    article.category,
    article.source_url,
    article.source_name,
    article.date
  );
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
      console.log(`[Scraper] Found ${articles.length} articles on page ${page}`);

      for (const article of articles) {
        totalScraped++;

        try {
          // Skip if already in database (deduplication by source_url)
          if (articleExists(article.source_url)) {
            console.log(`[Scraper] Skipping duplicate: ${article.title}`);
            continue;
          }

          // Delay between requests
          await sleep(REQUEST_DELAY_MS);

          // Fetch the full article content
          const detail = await scrapeArticleDetail(article.source_url);

          // Build the full article object
          const articleTitle = detail.title || article.title;
          const fullArticle: ScrapedArticle = {
            title: articleTitle,
            slug: generateSlug(articleTitle),
            description: generateSummary(
              detail.content.replace(/<[^>]*>/g, ''),
              160
            ),
            summary: generateSummary(
              detail.content.replace(/<[^>]*>/g, ''),
              250
            ),
            content: detail.content || article.title,
            thumbnail: detail.thumbnail || article.thumbnail,
            category: detail.category || article.category,
            source_url: article.source_url,
            source_name: SOURCE_NAME,
            date: article.date || detail.date,
          };

          // Insert into database
          insertArticle(fullArticle);
          newArticles++;
          console.log(`[Scraper] ✓ Added: ${fullArticle.title}`);
        } catch (error) {
          const msg = `Failed to scrape article: ${article.title} — ${error instanceof Error ? error.message : String(error)}`;
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
