import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title); }
    if (body.location !== undefined) { fields.push('location = ?'); values.push(body.location); }
    if (body.date !== undefined) { fields.push('date = ?'); values.push(body.date); }
    if (body.time_start !== undefined) { fields.push('time_start = ?'); values.push(body.time_start); }
    if (body.time_end !== undefined) { fields.push('time_end = ?'); values.push(body.time_end); }
    if (body.color !== undefined) { fields.push('color = ?'); values.push(body.color); }
    if (body.is_active !== undefined) { fields.push('is_active = ?'); values.push(body.is_active); }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    fields.push("updated_at = datetime('now')");
    values.push(parseInt(id));

    const stmt = db.prepare(`UPDATE jadwal_pelatihan SET ${fields.join(', ')} WHERE id = ?`);
    const info = stmt.run(...values);

    if (info.changes === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('[API] PUT /api/jadwal-pelatihan/:id error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const info = db.prepare('DELETE FROM jadwal_pelatihan WHERE id = ?').run(parseInt(id));

    if (info.changes === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /api/jadwal-pelatihan/:id error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
