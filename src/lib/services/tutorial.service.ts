/**
 * Tutorial Service — CRUD for layanan tutorials/guides.
 */

import db from '@/lib/db';

export type TutorialStatus = 'published' | 'draft';
export const TUTORIAL_CATEGORIES = ['AK1', 'Pengaduan', 'Pelatihan', 'Lowongan Kerja', 'Hubungan Industrial', 'Umum'] as const;

export interface TutorialStep {
  title: string;
  content: string;
}

export interface TutorialItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  thumbnail: string | null;
  steps: string; // JSON string of TutorialStep[]
  estimated_duration: string;
  cta_link: string | null;
  cta_text: string;
  status: TutorialStatus;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export function getTutorials(params: {
  category?: string;
  status?: TutorialStatus;
  page?: number;
  perPage?: number;
}): { items: TutorialItem[]; total: number; page: number; perPage: number } {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(100, params.perPage || 20);
  const offset = (page - 1) * perPage;

  const conditions: string[] = [];
  const qp: (string | number)[] = [];

  if (params.category) { conditions.push('category = ?'); qp.push(params.category); }
  if (params.status) { conditions.push('status = ?'); qp.push(params.status); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = (db.prepare(`SELECT COUNT(*) as c FROM tutorials ${where}`).get(...qp) as any)?.c || 0;
  const items = db.prepare(
    `SELECT * FROM tutorials ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...qp, perPage, offset) as TutorialItem[];

  return { items, total, page, perPage };
}

export function getTutorialById(id: number): TutorialItem | null {
  return db.prepare('SELECT * FROM tutorials WHERE id = ?').get(id) as TutorialItem | null;
}

export function getTutorialBySlug(slug: string): TutorialItem | null {
  return db.prepare('SELECT * FROM tutorials WHERE slug = ?').get(slug) as TutorialItem | null;
}

export function createTutorial(data: {
  title: string;
  slug: string;
  category: string;
  thumbnail?: string;
  steps: TutorialStep[];
  estimated_duration?: string;
  cta_link?: string;
  cta_text?: string;
  status?: TutorialStatus;
  created_by?: number;
}): number {
  const info = db.prepare(`
    INSERT INTO tutorials (title, slug, category, thumbnail, steps, estimated_duration, cta_link, cta_text, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.title,
    data.slug,
    data.category,
    data.thumbnail || null,
    JSON.stringify(data.steps || []),
    data.estimated_duration || '5 menit',
    data.cta_link || null,
    data.cta_text || 'Mulai Sekarang',
    data.status || 'draft',
    data.created_by || null
  );
  return Number(info.lastInsertRowid);
}

export function updateTutorial(id: number, data: Partial<{
  title: string;
  slug: string;
  category: string;
  thumbnail: string;
  steps: TutorialStep[];
  estimated_duration: string;
  cta_link: string;
  cta_text: string;
  status: TutorialStatus;
}>): boolean {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.title !== undefined) { fields.push('title = ?'); params.push(data.title); }
  if (data.slug !== undefined) { fields.push('slug = ?'); params.push(data.slug); }
  if (data.category !== undefined) { fields.push('category = ?'); params.push(data.category); }
  if (data.thumbnail !== undefined) { fields.push('thumbnail = ?'); params.push(data.thumbnail); }
  if (data.steps !== undefined) { fields.push('steps = ?'); params.push(JSON.stringify(data.steps)); }
  if (data.estimated_duration !== undefined) { fields.push('estimated_duration = ?'); params.push(data.estimated_duration); }
  if (data.cta_link !== undefined) { fields.push('cta_link = ?'); params.push(data.cta_link); }
  if (data.cta_text !== undefined) { fields.push('cta_text = ?'); params.push(data.cta_text); }
  if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }

  if (fields.length === 0) return false;

  fields.push("updated_at = datetime('now')");
  params.push(id);

  const info = db.prepare(`UPDATE tutorials SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  return info.changes > 0;
}

export function deleteTutorial(id: number): boolean {
  return db.prepare('DELETE FROM tutorials WHERE id = ?').run(id).changes > 0;
}
