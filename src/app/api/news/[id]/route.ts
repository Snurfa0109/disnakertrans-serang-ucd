import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const body = await request.json();
        const { title, description, content, thumbnail, date } = body;

        const stmt = db.prepare(`
      UPDATE news
      SET title = ?, description = ?, content = ?, thumbnail = ?, date = ?
      WHERE id = ?
    `);

        stmt.run(title, description, content || '', thumbnail || '', date, id);

        return NextResponse.json({ id, ...body });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const stmt = db.prepare('DELETE FROM news WHERE id = ?');
        stmt.run(id);

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
    }
}
