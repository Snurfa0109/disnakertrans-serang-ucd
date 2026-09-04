import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const items = await sql`SELECT * FROM jadwal_pelatihan WHERE is_active = TRUE ORDER BY date ASC`;
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[API] GET /api/jadwal-pelatihan error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Sesi admin diperlukan' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, location, date, time_start, time_end, color } = body;

    if (!title || !location || !date) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO jadwal_pelatihan (title, location, date, time_start, time_end, color, is_active)
      VALUES (${title}, ${location}, ${date}, ${time_start || '08:00'}, ${time_end || 'Selesai'}, ${color || 'bg-green-500'}, TRUE)
      RETURNING id
    `;

    return NextResponse.json({ success: true, data: { id: result[0].id } }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/jadwal-pelatihan error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });
  }
}
