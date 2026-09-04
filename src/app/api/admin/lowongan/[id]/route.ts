import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT /api/admin/lowongan/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const allowedRoles = ['superadmin', 'binapenta', 'lattas'];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const numId = parseInt(id);
    const body = await req.json();
    const { title, company, location, job_type, education, deadline, salary, category, logo_url, source_url, is_active } = body;

    await sql`
      UPDATE lowongan SET
        title = ${title}, company = ${company}, location = ${location || 'Kabupaten Serang'},
        job_type = ${job_type || 'Full time'}, education = ${education || 'SMA/SMK'},
        deadline = ${deadline || ''}, salary = ${salary || ''}, category = ${category || 'Dalam Negeri'},
        logo_url = ${logo_url || ''}, source_url = ${source_url || ''},
        is_active = ${is_active !== undefined ? (is_active ? 1 : 0) : 1},
        updated_at = NOW()
      WHERE id = ${numId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/admin/lowongan/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  if (!['superadmin', 'binapenta'].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await sql`DELETE FROM lowongan WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
