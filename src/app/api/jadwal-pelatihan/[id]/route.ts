import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const fields: string[] = [];
    const values: (string | number | boolean)[] = [];

    if (body.title !== undefined)      { fields.push(`title = $${values.length + 1}`);      values.push(body.title); }
    if (body.location !== undefined)   { fields.push(`location = $${values.length + 1}`);   values.push(body.location); }
    if (body.date !== undefined)       { fields.push(`date = $${values.length + 1}`);       values.push(body.date); }
    if (body.time_start !== undefined) { fields.push(`time_start = $${values.length + 1}`); values.push(body.time_start); }
    if (body.time_end !== undefined)   { fields.push(`time_end = $${values.length + 1}`);   values.push(body.time_end); }
    if (body.color !== undefined)      { fields.push(`color = $${values.length + 1}`);      values.push(body.color); }
    if (body.is_active !== undefined)  { fields.push(`is_active = $${values.length + 1}`);  values.push(Boolean(body.is_active)); }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    fields.push('updated_at = NOW()');
    values.push(parseInt(id));

    const result = await sql.unsafe(
      `UPDATE jadwal_pelatihan SET ${fields.join(', ')} WHERE id = $${values.length}`,
      values
    );

    if (result.count === 0) {
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
    const result = await sql`DELETE FROM jadwal_pelatihan WHERE id = ${parseInt(id)}`;

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /api/jadwal-pelatihan/:id error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
