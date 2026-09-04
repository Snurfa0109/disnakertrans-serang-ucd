import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT /api/admin/events/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const numId = parseInt(id);
    const body = await req.json();
    const { title, location, date, time_start, time_end, organizer, link_url, is_active } = body;

    await sql`
      UPDATE events SET
        title = ${title}, location = ${location}, date = ${date},
        time_start = ${time_start || '08:00'}, time_end = ${time_end || 'Selesai'},
        organizer = ${organizer || 'Disnakertrans Kab. Serang'},
        link_url = ${link_url || ''},
        is_active = ${is_active !== undefined ? (is_active ? 1 : 0) : 1},
        updated_at = NOW()
      WHERE id = ${numId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/admin/events/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  if (!['superadmin', 'website', 'lattas'].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await sql`DELETE FROM events WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
