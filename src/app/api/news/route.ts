import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
    try {
        const news = db.prepare('SELECT * FROM news ORDER BY date DESC').all();
        return NextResponse.json(news);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, content, thumbnail, date } = body;

        if (!title || !description || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const stmt = db.prepare(`
      INSERT INTO news (title, description, content, thumbnail, date)
      VALUES (?, ?, ?, ?, ?)
    `);

        const info = stmt.run(title, description, content || '', thumbnail || '', date);

        return NextResponse.json({ id: info.lastInsertRowid, ...body }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
    }
}
