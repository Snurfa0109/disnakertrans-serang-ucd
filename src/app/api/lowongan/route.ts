import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/lowongan
 * Returns all active job vacancies scraped from Karir Serang
 */
export async function GET() {
  try {
    const rows = await sql`
      SELECT * FROM lowongan
      WHERE is_active = TRUE
      ORDER BY id DESC
    ` as any[];

    return NextResponse.json(
      successResponse({
        lowongan: rows,
        total: rows.length,
      })
    );
  } catch (error) {
    console.error('[API] GET /api/lowongan error:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch lowongan data: ' + (error instanceof Error ? error.message : String(error))),
      { status: 500 }
    );
  }
}
