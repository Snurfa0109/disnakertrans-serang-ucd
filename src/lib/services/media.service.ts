/**
 * Media Library Service — file metadata management.
 * Files are stored on disk at /public/uploads/.
 */

import db from '@/lib/db';

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

export function listMedia(params: {
  fileType?: 'image' | 'pdf' | 'document';
  category?: string;
  search?: string;
  page?: number;
  perPage?: number;
}): { items: MediaItem[]; total: number; page: number; perPage: number } {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(100, params.perPage || 24);
  const offset = (page - 1) * perPage;

  const conditions: string[] = [];
  const qp: (string | number)[] = [];

  if (params.fileType) { conditions.push('file_type = ?'); qp.push(params.fileType); }
  if (params.category) { conditions.push('category = ?'); qp.push(params.category); }
  if (params.search) {
    conditions.push('(original_name LIKE ? OR filename LIKE ?)');
    qp.push(`%${params.search}%`, `%${params.search}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = (db.prepare(`SELECT COUNT(*) as c FROM media_library ${where}`).get(...qp) as any)?.c || 0;
  const items = db.prepare(
    `SELECT * FROM media_library ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...qp, perPage, offset) as MediaItem[];

  return { items, total, page, perPage };
}

export function saveMedia(data: {
  filename: string;
  original_name: string;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  category?: string;
  url: string;
  uploaded_by?: number;
}): number {
  const info = db.prepare(`
    INSERT INTO media_library (filename, original_name, file_type, mime_type, size_bytes, category, url, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.filename,
    data.original_name,
    data.file_type,
    data.mime_type,
    data.size_bytes,
    data.category || 'Umum',
    data.url,
    data.uploaded_by || null
  );
  return Number(info.lastInsertRowid);
}

export function getMediaById(id: number): MediaItem | null {
  return db.prepare('SELECT * FROM media_library WHERE id = ?').get(id) as MediaItem | null;
}

export function deleteMedia(id: number): MediaItem | null {
  const item = getMediaById(id);
  if (!item) return null;
  db.prepare('DELETE FROM media_library WHERE id = ?').run(id);
  return item;
}
