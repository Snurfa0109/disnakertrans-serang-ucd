/**
 * FAQ Service — CRUD for frequently asked questions.
 */

import sql from '@/lib/db';

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

export async function getFaqs(params: {
  category?: string;
  status?: FaqStatus;
  page?: number;
  perPage?: number;
}): Promise<{ items: FaqItem[]; total: number; page: number; perPage: number }> {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(100, params.perPage || 20);
  const offset = (page - 1) * perPage;

  const conditions: string[] = [];
  const qp: (string | number)[] = [];

  if (params.category) { conditions.push(`category = $${qp.length + 1}`); qp.push(params.category); }
  if (params.status)   { conditions.push(`status = $${qp.length + 1}`);   qp.push(params.status); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await sql.unsafe(`SELECT COUNT(*) AS c FROM faqs ${where}`, qp);
  const total = Number(countResult[0]?.c) || 0;

  const listParams = [...qp, perPage, offset];
  const items = await sql.unsafe(
    `SELECT * FROM faqs ${where} ORDER BY sort_order ASC, id ASC LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams
  ) as FaqItem[];

  return { items, total, page, perPage };
}

export async function getFaqById(id: number): Promise<FaqItem | null> {
  const rows = await sql`SELECT * FROM faqs WHERE id = ${id}`;
  return (rows[0] as FaqItem) || null;
}

export async function createFaq(data: {
  question: string;
  answer: string;
  category: string;
  status?: FaqStatus;
  sort_order?: number;
  created_by?: number;
}): Promise<number> {
  const result = await sql`
    INSERT INTO faqs (question, answer, category, status, sort_order, created_by)
    VALUES (
      ${data.question}, ${data.answer}, ${data.category},
      ${data.status || 'draft'}, ${data.sort_order || 0}, ${data.created_by || null}
    )
    RETURNING id
  `;
  return Number(result[0].id);
}

export async function updateFaq(id: number, data: Partial<{
  question: string;
  answer: string;
  category: string;
  status: FaqStatus;
  sort_order: number;
}>): Promise<boolean> {
  const fields: string[] = [];
  const params: (string | number)[] = [];

  if (data.question !== undefined)   { fields.push(`question = $${params.length + 1}`);   params.push(data.question); }
  if (data.answer !== undefined)     { fields.push(`answer = $${params.length + 1}`);     params.push(data.answer); }
  if (data.category !== undefined)   { fields.push(`category = $${params.length + 1}`);   params.push(data.category); }
  if (data.status !== undefined)     { fields.push(`status = $${params.length + 1}`);     params.push(data.status); }
  if (data.sort_order !== undefined) { fields.push(`sort_order = $${params.length + 1}`); params.push(data.sort_order); }

  if (fields.length === 0) return false;

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await sql.unsafe(
    `UPDATE faqs SET ${fields.join(', ')} WHERE id = $${params.length}`,
    params
  );
  return result.count > 0;
}

export async function deleteFaq(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM faqs WHERE id = ${id}`;
  return result.count > 0;
}
