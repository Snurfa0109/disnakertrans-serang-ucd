import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const items = db.prepare('SELECT * FROM jadwal_pelatihan WHERE is_active = 1 ORDER BY date ASC').all();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[API] GET /api/jadwal-pelatihan error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, location, date, time_start, time_end, color } = body;

    if (!title || !location || !date) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO jadwal_pelatihan (title, location, date, time_start, time_end, color, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    const info = stmt.run(title, location, date, time_start || '08:00', time_end || 'Selesai', color || 'bg-green-500');

    return NextResponse.json({ success: true, data: { id: info.lastInsertRowid } }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/jadwal-pelatihan error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });
  }
}
