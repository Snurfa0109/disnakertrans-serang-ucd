/**
 * Content Service — manages site CMS key-value store.
 */

import db from '@/lib/db';

export interface ContentItem {
  id: number;
  key: string;
  label: string;
  value: string;
  type: string;
  section: string;
  updated_by: number | null;
  updated_at: string;
}

export function getSiteContent(section?: string): ContentItem[] {
  if (section) {
    return db.prepare('SELECT * FROM site_content WHERE section = ? ORDER BY id ASC').all(section) as ContentItem[];
  }
  return db.prepare('SELECT * FROM site_content ORDER BY section ASC, id ASC').all() as ContentItem[];
}

export function getSiteContentByKey(key: string): string | null {
  const row = db.prepare('SELECT value FROM site_content WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSiteContent(key: string, value: string, updatedBy?: number): boolean {
  const info = db.prepare(`
    UPDATE site_content 
    SET value = ?, updated_by = ?, updated_at = datetime('now')
    WHERE key = ?
  `).run(value, updatedBy ?? null, key);
  return info.changes > 0;
}

export function bulkSetSiteContent(items: { key: string; value: string }[], updatedBy?: number): void {
  const stmt = db.prepare(`
    UPDATE site_content 
    SET value = ?, updated_by = ?, updated_at = datetime('now')
    WHERE key = ?
  `);
  const runMany = db.transaction((rows: { key: string; value: string }[]) => {
    for (const row of rows) {
      stmt.run(row.value, updatedBy ?? null, row.key);
    }
  });
  runMany(items);
}
