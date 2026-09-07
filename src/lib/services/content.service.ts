/**
 * Content Service — manages site CMS key-value store.
 */

import sql from '@/lib/db';

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

export async function getSiteContent(section?: string): Promise<ContentItem[]> {
  try {
    if (section) {
      return await sql`SELECT * FROM site_content WHERE section = ${section} ORDER BY id ASC` as ContentItem[];
    }
    return await sql`SELECT * FROM site_content ORDER BY section ASC, id ASC` as ContentItem[];
  } catch (err) {
    console.error('[getSiteContent] Error:', err);
    return [];
  }
}

export async function getSiteContentByKey(key: string): Promise<string | null> {
  try {
    const rows = await sql`SELECT value FROM site_content WHERE \`key\` = ${key}`;
    return (rows[0] as { value: string } | undefined)?.value ?? null;
  } catch (err) {
    console.error(`[getSiteContentByKey] Error for ${key}:`, err);
    return null;
  }
}

export async function setSiteContent(key: string, value: string, updatedBy?: number): Promise<boolean> {
  const result = await sql`
    UPDATE site_content
    SET value = ${value}, updated_by = ${updatedBy ?? null}, updated_at = NOW()
    WHERE \`key\` = ${key}
  ` as any;
  return (result?.affectedRows ?? 0) > 0;
}

export async function bulkSetSiteContent(items: { key: string; value: string }[], updatedBy?: number): Promise<void> {
  // Run as sequential updates
  for (const row of items) {
    await sql`
      UPDATE site_content
      SET value = ${row.value}, updated_by = ${updatedBy ?? null}, updated_at = NOW()
      WHERE \`key\` = ${row.key}
    `;
  }
}
