/**
 * News Service — Business logic layer for news data.
 *
 * Handles querying, filtering, searching, and pagination.
 * All responses go through the cache layer for performance.
 */

import sql from '@/lib/db';
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
export async function getNewsList(params: NewsPaginationParams = {}) {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(50, Math.max(1, params.perPage || 10));
  const offset = (page - 1) * perPage;

  const cacheKey = `news:list:${page}:${perPage}:${params.category || ''}:${params.search || ''}`;
  const cached = cache.get<{ items: NewsItem[]; total: number }>(cacheKey);
  if (cached) return { ...cached, page, perPage };

  const conditions: string[] = [];
  const qp: (string | number)[] = [];

  if (params.category) {
    conditions.push(`category = $${qp.length + 1}`);
    qp.push(params.category);
  }
  if (params.search) {
    conditions.push(`(title ILIKE $${qp.length + 1} OR description ILIKE $${qp.length + 2})`);
    qp.push(`%${params.search}%`, `%${params.search}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await sql.unsafe(`SELECT COUNT(*) AS total FROM news ${where}`, qp);
  const total = Number(countResult[0]?.total) || 0;

  const listParams = [...qp, perPage, offset];
  const items = await sql.unsafe(
    `SELECT * FROM news ${where} ORDER BY date DESC LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams
  ) as NewsItem[];

  const result = { items, total };
  cache.set(cacheKey, result, 120);

  return { ...result, page, perPage };
}

/**
 * Get latest N news items (for homepage).
 */
export async function getLatestNews(limit = 6): Promise<NewsItem[]> {
  const cacheKey = `news:latest:${limit}`;
  const cached = cache.get<NewsItem[]>(cacheKey);
  if (cached) return cached;

  const items = await sql`SELECT * FROM news ORDER BY date DESC LIMIT ${limit}` as NewsItem[];

  cache.set(cacheKey, items, 120);
  return items;
}

/**
 * Get a single news item by ID.
 */
export async function getNewsById(id: number): Promise<NewsItem | null> {
  const cacheKey = `news:id:${id}`;
  const cached = cache.get<NewsItem>(cacheKey);
  if (cached) return cached;

  const rows = await sql`SELECT * FROM news WHERE id = ${id}`;
  const item = rows[0] as NewsItem | undefined;
  if (item) cache.set(cacheKey, item, 300);
  return item || null;
}

/**
 * Get a single news item by slug.
 */
export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const cacheKey = `news:slug:${slug}`;
  const cached = cache.get<NewsItem>(cacheKey);
  if (cached) return cached;

  const rows = await sql`SELECT * FROM news WHERE slug = ${slug}`;
  const item = rows[0] as NewsItem | undefined;
  if (item) cache.set(cacheKey, item, 300);
  return item || null;
}

/**
 * Search news by title (with pagination).
 */
export async function searchNews(query: string, page = 1, perPage = 10) {
  return getNewsList({ page, perPage, search: query });
}

/**
 * Create a news item manually (for admin).
 */
export async function createNews(data: {
  title: string;
  description: string;
  content?: string;
  thumbnail?: string;
  category?: string;
  date: string;
  slug?: string;
  source_url?: string;
  link_url?: string;
}): Promise<number> {
  const slug = data.slug || generateSlugFromTitle(data.title);
  const summary = data.content
    ? data.content.replace(/<[^>]*>/g, '').substring(0, 250) + '...'
    : data.description;

  const result = await sql`
    INSERT INTO news (title, slug, description, summary, content, thumbnail, category, source_url, source_name, link_url, date, created_at, updated_at)
    VALUES (
      ${data.title},
      ${slug},
      ${data.description},
      ${summary},
      ${data.content || ''},
      ${data.thumbnail || ''},
      ${data.category || 'Umum'},
      ${data.source_url || null},
      ${'Manual Entry'},
      ${data.link_url || null},
      ${data.date},
      NOW(),
      NOW()
    )
    RETURNING id
  `;

  cache.invalidateByPrefix('news:');
  return Number(result[0].id);
}

/**
 * Update a news item.
 */
export async function updateNews(id: number, data: Partial<{
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  category: string;
  date: string;
  link_url: string;
}>): Promise<boolean> {
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (data.title !== undefined)       { fields.push(`title = $${values.length + 1}`);       values.push(data.title); }
  if (data.description !== undefined) { fields.push(`description = $${values.length + 1}`); values.push(data.description); }
  if (data.content !== undefined)     { fields.push(`content = $${values.length + 1}`);     values.push(data.content); }
  if (data.thumbnail !== undefined)   { fields.push(`thumbnail = $${values.length + 1}`);   values.push(data.thumbnail); }
  if (data.category !== undefined)    { fields.push(`category = $${values.length + 1}`);    values.push(data.category); }
  if (data.date !== undefined)        { fields.push(`date = $${values.length + 1}`);        values.push(data.date); }
  if (data.link_url !== undefined)    { fields.push(`link_url = $${values.length + 1}`);    values.push(data.link_url); }

  if (fields.length === 0) return false;

  fields.push('updated_at = NOW()');
  values.push(id);

  const result = await sql.unsafe(
    `UPDATE news SET ${fields.join(', ')} WHERE id = $${values.length}`,
    values
  );

  cache.invalidateByPrefix('news:');
  return result.count > 0;
}

/**
 * Delete a news item.
 */
export async function deleteNews(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM news WHERE id = ${id}`;
  cache.invalidateByPrefix('news:');
  return result.count > 0;
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
