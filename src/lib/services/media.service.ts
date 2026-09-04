/**
 * Media Library Service — file metadata management.
 * Files are stored on disk at /public/uploads/.
 */

import sql from '@/lib/db';

export interface MediaItem {
  id: number;
  filename: string;
  original_name: string;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  category: string;
  url: string;
  uploaded_by: number | null;
  created_at: string;
}

export const MEDIA_CATEGORIES = ['Umum', 'Berita', 'Sambutan', 'Dokumen', 'Infografis', 'Kegiatan'] as const;

export async function listMedia(params: {
  fileType?: 'image' | 'pdf' | 'document';
  category?: string;
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<{ items: MediaItem[]; total: number; page: number; perPage: number }> {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(100, params.perPage || 24);
  const offset = (page - 1) * perPage;

  const conditions: string[] = [];
  const qp: (string | number)[] = [];

  if (params.fileType) { conditions.push(`file_type = $${qp.length + 1}`); qp.push(params.fileType); }
  if (params.category) { conditions.push(`category = $${qp.length + 1}`);  qp.push(params.category); }
  if (params.search) {
    conditions.push(`(original_name ILIKE $${qp.length + 1} OR filename ILIKE $${qp.length + 2})`);
    qp.push(`%${params.search}%`, `%${params.search}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await sql.unsafe(`SELECT COUNT(*) AS c FROM media_library ${where}`, qp);
  const total = Number(countResult[0]?.c) || 0;

  const listParams = [...qp, perPage, offset];
  const items = await sql.unsafe(
    `SELECT * FROM media_library ${where} ORDER BY created_at DESC LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams
  ) as MediaItem[];

  return { items, total, page, perPage };
}

export async function saveMedia(data: {
  filename: string;
  original_name: string;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  category?: string;
  url: string;
  uploaded_by?: number;
}): Promise<number> {
  const result = await sql`
    INSERT INTO media_library (filename, original_name, file_type, mime_type, size_bytes, category, url, uploaded_by)
    VALUES (
      ${data.filename}, ${data.original_name}, ${data.file_type}, ${data.mime_type},
      ${data.size_bytes}, ${data.category || 'Umum'}, ${data.url}, ${data.uploaded_by || null}
    )
    RETURNING id
  `;
  return Number(result[0].id);
}

export async function getMediaById(id: number): Promise<MediaItem | null> {
  const rows = await sql`SELECT * FROM media_library WHERE id = ${id}`;
  return (rows[0] as MediaItem) || null;
}

export async function deleteMedia(id: number): Promise<MediaItem | null> {
  const item = await getMediaById(id);
  if (!item) return null;
  await sql`DELETE FROM media_library WHERE id = ${id}`;
  return item;
}
