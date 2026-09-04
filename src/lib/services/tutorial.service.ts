/**
 * Tutorial Service — CRUD for layanan tutorials/guides.
 */

import sql from '@/lib/db';

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

export async function getTutorials(params: {
  category?: string;
  status?: TutorialStatus;
  page?: number;
  perPage?: number;
}): Promise<{ items: TutorialItem[]; total: number; page: number; perPage: number }> {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(100, params.perPage || 20);
  const offset = (page - 1) * perPage;

  const conditions: string[] = [];
  const qp: (string | number)[] = [];

  if (params.category) { conditions.push(`category = $${qp.length + 1}`); qp.push(params.category); }
  if (params.status)   { conditions.push(`status = $${qp.length + 1}`);   qp.push(params.status); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await sql.unsafe(`SELECT COUNT(*) AS c FROM tutorials ${where}`, qp);
  const total = Number(countResult[0]?.c) || 0;

  const listParams = [...qp, perPage, offset];
  const items = await sql.unsafe(
    `SELECT * FROM tutorials ${where} ORDER BY created_at DESC LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams
  ) as TutorialItem[];

  return { items, total, page, perPage };
}

export async function getTutorialById(id: number): Promise<TutorialItem | null> {
  const rows = await sql`SELECT * FROM tutorials WHERE id = ${id}`;
  return (rows[0] as TutorialItem) || null;
}

export async function getTutorialBySlug(slug: string): Promise<TutorialItem | null> {
  const rows = await sql`SELECT * FROM tutorials WHERE slug = ${slug}`;
  return (rows[0] as TutorialItem) || null;
}

export async function createTutorial(data: {
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
}): Promise<number> {
  const result = await sql`
    INSERT INTO tutorials (title, slug, category, thumbnail, steps, estimated_duration, cta_link, cta_text, status, created_by)
    VALUES (
      ${data.title}, ${data.slug}, ${data.category}, ${data.thumbnail || null},
      ${JSON.stringify(data.steps || [])}, ${data.estimated_duration || '5 menit'},
      ${data.cta_link || null}, ${data.cta_text || 'Mulai Sekarang'},
      ${data.status || 'draft'}, ${data.created_by || null}
    )
    RETURNING id
  `;
  return Number(result[0].id);
}

export async function updateTutorial(id: number, data: Partial<{
  title: string;
  slug: string;
  category: string;
  thumbnail: string;
  steps: TutorialStep[];
  estimated_duration: string;
  cta_link: string;
  cta_text: string;
  status: TutorialStatus;
}>): Promise<boolean> {
  const fields: string[] = [];
  const params: (string | null)[] = [];

  if (data.title !== undefined)              { fields.push(`title = $${params.length + 1}`);              params.push(data.title); }
  if (data.slug !== undefined)               { fields.push(`slug = $${params.length + 1}`);               params.push(data.slug); }
  if (data.category !== undefined)           { fields.push(`category = $${params.length + 1}`);           params.push(data.category); }
  if (data.thumbnail !== undefined)          { fields.push(`thumbnail = $${params.length + 1}`);          params.push(data.thumbnail); }
  if (data.steps !== undefined)              { fields.push(`steps = $${params.length + 1}`);              params.push(JSON.stringify(data.steps)); }
  if (data.estimated_duration !== undefined) { fields.push(`estimated_duration = $${params.length + 1}`); params.push(data.estimated_duration); }
  if (data.cta_link !== undefined)           { fields.push(`cta_link = $${params.length + 1}`);           params.push(data.cta_link); }
  if (data.cta_text !== undefined)           { fields.push(`cta_text = $${params.length + 1}`);           params.push(data.cta_text); }
  if (data.status !== undefined)             { fields.push(`status = $${params.length + 1}`);             params.push(data.status); }

  if (fields.length === 0) return false;

  fields.push('updated_at = NOW()');
  params.push(String(id));

  const result = await sql.unsafe(
    `UPDATE tutorials SET ${fields.join(', ')} WHERE id = $${params.length}`,
    params
  );
  return result.count > 0;
}

export async function deleteTutorial(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM tutorials WHERE id = ${id}`;
  return result.count > 0;
}
