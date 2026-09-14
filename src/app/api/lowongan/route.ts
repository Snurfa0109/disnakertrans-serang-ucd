import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils';
import lowonganBackup from '@/data/lowongan-backup.json';

export const dynamic = 'force-dynamic';

/**
 * GET /api/lowongan
 * Returns all active job vacancies scraped from Karir Serang
 */
export async function GET() {
  let rows: any[] = [];
  try {
    rows = await sql`
      SELECT * FROM lowongan
      WHERE is_active = TRUE
      ORDER BY id DESC
    ` as any[];
  } catch (error) {
    console.error('[API] GET /api/lowongan error:', error);
  }

  if (!rows || rows.length === 0) {
    rows = lowonganBackup as any[];
  }

  return NextResponse.json(
    successResponse({
      lowongan: rows,
      total: rows.length,
    })
  );
}
