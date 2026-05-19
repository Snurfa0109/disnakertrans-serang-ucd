/**
 * News Service — Business logic layer for news data.
 * 
 * Handles querying, filtering, searching, and pagination.
 * All responses go through the cache layer for performance.
 */

import db from '@/lib/db';
import cache from '@/lib/cache';

export interface NewsItem {
  id: number;
  title: string;
  slug: string | null;
  description: string;
  summary: string | null;
  content: string | null;
  thumbnail: string | null;
  category: string | null;
  source_url: string | null;
  source_name: string | null;
  link_url: string | null;
  date: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface NewsPaginationParams {
  page?: number;
  perPage?: number;
  category?: string;
  search?: string;
}

/**
 * Get paginated news list, sorted by date DESC.
 */
export function getNewsList(params: NewsPaginationParams = {}) {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(50, Math.max(1, params.perPage || 10));
  const offset = (page - 1) * perPage;

  const cacheKey = `news:list:${page}:${perPage}:${params.category || ''}:${params.search || ''}`;
  const cached = cache.get<{ items: NewsItem[]; total: number }>(cacheKey);
  if (cached) return { ...cached, page, perPage };

  let whereClause = '';
  const queryParams: (string | number)[] = [];

  if (params.category) {
    whereClause += ' WHERE category = ?';
    queryParams.push(params.category);
  }

  if (params.search) {
    whereClause += whereClause ? ' AND' : ' WHERE';
    whereClause += ' (title LIKE ? OR description LIKE ?)';
    const searchTerm = `%${params.search}%`;
    queryParams.push(searchTerm, searchTerm);
  }

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM news${whereClause}`);
  const countRow = (queryParams.length > 0 ? countStmt.get(...queryParams) : countStmt.get()) as { total: number } | undefined;
  const total = countRow?.total || 0;

  const listStmt = db.prepare(
    `SELECT * FROM news${whereClause} ORDER BY date DESC LIMIT ? OFFSET ?`
  );
  const listParams = [...queryParams, perPage, offset];
  const items = listStmt.all(...listParams) as NewsItem[];

  const result = { items, total };
  cache.set(cacheKey, result, 120); // Cache for 2 minutes

  return { ...result, page, perPage };
}

/**
 * Get latest N news items (for homepage).
 */
export function getLatestNews(limit = 6): NewsItem[] {
  const cacheKey = `news:latest:${limit}`;
  const cached = cache.get<NewsItem[]>(cacheKey);
  if (cached) return cached;

  const items = db.prepare(
    'SELECT * FROM news ORDER BY date DESC LIMIT ?'
  ).all(limit) as NewsItem[];

  cache.set(cacheKey, items, 120);
  return items;
}

/**
 * Get a single news item by ID.
 */
export function getNewsById(id: number): NewsItem | null {
  const cacheKey = `news:id:${id}`;
  const cached = cache.get<NewsItem>(cacheKey);
  if (cached) return cached;

  const item = db.prepare('SELECT * FROM news WHERE id = ?').get(id) as NewsItem | undefined;
  if (item) {
    cache.set(cacheKey, item, 300);
  }
  return item || null;
}

/**
 * Get a single news item by slug.
 */
export function getNewsBySlug(slug: string): NewsItem | null {
  const cacheKey = `news:slug:${slug}`;
  const cached = cache.get<NewsItem>(cacheKey);
  if (cached) return cached;

  const item = db.prepare('SELECT * FROM news WHERE slug = ?').get(slug) as NewsItem | undefined;
  if (item) {
    cache.set(cacheKey, item, 300);
  }
  return item || null;
}

/**
 * Search news by title (with pagination).
 */
export function searchNews(query: string, page = 1, perPage = 10) {
  return getNewsList({ page, perPage, search: query });
}

/**
 * Create a news item manually (for admin).
 */
export function createNews(data: {
  title: string;
  description: string;
  content?: string;
  thumbnail?: string;
  category?: string;
  date: string;
  slug?: string;
  source_url?: string;
  link_url?: string;
}): number {
  const slug = data.slug || generateSlugFromTitle(data.title);
  const summary = data.content
    ? data.content.replace(/<[^>]*>/g, '').substring(0, 250) + '...'
    : data.description;

  const stmt = db.prepare(`
    INSERT INTO news (title, slug, description, summary, content, thumbnail, category, source_url, source_name, link_url, date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Manual Entry', ?, ?, datetime('now'), datetime('now'))
  `);

  const info = stmt.run(
    data.title,
    slug,
    data.description,
    summary,
    data.content || '',
    data.thumbnail || '',
    data.category || 'Umum',
    data.source_url || null,
    data.link_url || null,
    data.date
  );

  // Invalidate cache
  cache.invalidateByPrefix('news:');

  return Number(info.lastInsertRowid);
}

/**
 * Update a news item.
 */
export function updateNews(id: number, data: Partial<{
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  category: string;
  date: string;
  link_url: string;
}>): boolean {
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
  if (data.content !== undefined) { fields.push('content = ?'); values.push(data.content); }
  if (data.thumbnail !== undefined) { fields.push('thumbnail = ?'); values.push(data.thumbnail); }
  if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
  if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
  if (data.link_url !== undefined) { fields.push('link_url = ?'); values.push(data.link_url); }

  if (fields.length === 0) return false;

  fields.push("updated_at = datetime('now')");
  values.push(id);

  const stmt = db.prepare(`UPDATE news SET ${fields.join(', ')} WHERE id = ?`);
  const info = stmt.run(...values);

  cache.invalidateByPrefix('news:');

  return info.changes > 0;
}

/**
 * Delete a news item.
 */
export function deleteNews(id: number): boolean {
  const info = db.prepare('DELETE FROM news WHERE id = ?').run(id);
  cache.invalidateByPrefix('news:');
  return info.changes > 0;
}

function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
