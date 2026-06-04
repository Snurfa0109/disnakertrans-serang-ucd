/**
 * FAQ Service — CRUD for frequently asked questions.
 */

import db from '@/lib/db';

export type FaqStatus = 'published' | 'draft';
export const FAQ_CATEGORIES = ['AK1', 'Pengaduan', 'Pelatihan', 'Lowongan Kerja', 'Hubungan Industrial', 'Umum'] as const;

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  status: FaqStatus;
  sort_order: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export function getFaqs(params: {
  category?: string;
  status?: FaqStatus;
  page?: number;
  perPage?: number;
}): { items: FaqItem[]; total: number; page: number; perPage: number } {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(100, params.perPage || 20);
  const offset = (page - 1) * perPage;

  const conditions: string[] = [];
  const qp: (string | number)[] = [];

  if (params.category) { conditions.push('category = ?'); qp.push(params.category); }
  if (params.status) { conditions.push('status = ?'); qp.push(params.status); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = (db.prepare(`SELECT COUNT(*) as c FROM faqs ${where}`).get(...qp) as any)?.c || 0;
  const items = db.prepare(
    `SELECT * FROM faqs ${where} ORDER BY sort_order ASC, id ASC LIMIT ? OFFSET ?`
  ).all(...qp, perPage, offset) as FaqItem[];

  return { items, total, page, perPage };
}

export function getFaqById(id: number): FaqItem | null {
  return db.prepare('SELECT * FROM faqs WHERE id = ?').get(id) as FaqItem | null;
}

export function createFaq(data: {
  question: string;
  answer: string;
  category: string;
  status?: FaqStatus;
  sort_order?: number;
  created_by?: number;
}): number {
  const info = db.prepare(`
    INSERT INTO faqs (question, answer, category, status, sort_order, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    data.question,
    data.answer,
    data.category,
    data.status || 'draft',
    data.sort_order || 0,
    data.created_by || null
  );
  return Number(info.lastInsertRowid);
}

export function updateFaq(id: number, data: Partial<{
  question: string;
  answer: string;
  category: string;
  status: FaqStatus;
  sort_order: number;
}>): boolean {
  const fields: string[] = [];
  const params: (string | number)[] = [];

  if (data.question !== undefined) { fields.push('question = ?'); params.push(data.question); }
  if (data.answer !== undefined) { fields.push('answer = ?'); params.push(data.answer); }
  if (data.category !== undefined) { fields.push('category = ?'); params.push(data.category); }
  if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }
  if (data.sort_order !== undefined) { fields.push('sort_order = ?'); params.push(data.sort_order); }

  if (fields.length === 0) return false;

  fields.push("updated_at = datetime('now')");
  params.push(id);

  const info = db.prepare(`UPDATE faqs SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  return info.changes > 0;
}

export function deleteFaq(id: number): boolean {
  return db.prepare('DELETE FROM faqs WHERE id = ?').run(id).changes > 0;
}
