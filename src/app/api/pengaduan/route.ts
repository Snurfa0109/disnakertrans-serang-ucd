import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, message } = body;
        const date = new Date().toISOString();

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const stmt = db.prepare(`
      INSERT INTO pengaduan (name, email, message, date)
      VALUES (?, ?, ?, ?)
    `);

        const info = stmt.run(name, email, message, date);

        return NextResponse.json({ id: info.lastInsertRowid, success: true }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }
}
