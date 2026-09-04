import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/events — list all (admin only)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const perPage = Math.min(50, parseInt(searchParams.get('perPage') || '20'));
  const offset = (page - 1) * perPage;
  const search = searchParams.get('search') || '';

  try {
    let rows: any[];
    let countRows: any[];

    if (search) {
      rows = await sql`
        SELECT * FROM events
        WHERE title LIKE ${`%${search}%`} OR location LIKE ${`%${search}%`}
        ORDER BY id DESC LIMIT ${perPage} OFFSET ${offset}
      `;
      countRows = await sql`
        SELECT COUNT(*) AS total FROM events
        WHERE title LIKE ${`%${search}%`} OR location LIKE ${`%${search}%`}
      `;
    } else {
      rows = await sql`SELECT * FROM events ORDER BY id DESC LIMIT ${perPage} OFFSET ${offset}`;
      countRows = await sql`SELECT COUNT(*) AS total FROM events`;
    }

    return NextResponse.json({
      success: true,
      data: rows,
      meta: { total: Number(countRows[0].total), page, perPage },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/admin/events — create
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const allowedRoles = ['superadmin', 'website', 'lattas', 'binapenta', 'hijamsostek'];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, location, date, time_start, time_end, organizer, link_url } = body;

    if (!title || !location || !date) {
      return NextResponse.json({ success: false, error: 'Judul, lokasi, dan tanggal wajib diisi' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO events (title, location, date, time_start, time_end, organizer, link_url, is_active)
      VALUES (
        ${title}, ${location}, ${date}, ${time_start || '08:00'},
        ${time_end || 'Selesai'}, ${organizer || 'Disnakertrans Kab. Serang'},
        ${link_url || ''}, 1
      )
    `;

    return NextResponse.json({ success: true, data: { id: (result as any).insertId } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
