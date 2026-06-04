import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const items = db.prepare('SELECT * FROM statistik ORDER BY sort_order ASC').all();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[API] GET /api/statistik error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { label, value, description } = await request.json();
    const insert = db.prepare('INSERT INTO statistik (label, value, description) VALUES (?, ?, ?)');
    insert.run(label, value, description || '');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] POST /api/statistik error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { items } = body; // array of { id, label, value, description }

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Items must be an array' }, { status: 400 });
    }

    const stmt = db.prepare(`UPDATE statistik SET label = ?, value = ?, description = ?, updated_at = datetime('now') WHERE id = ?`);

    const updateMany = db.transaction((rows: any[]) => {
      for (const row of rows) {
        stmt.run(row.label, row.value, row.description || '', row.id);
      }
    });

    updateMany(items);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] PUT /api/statistik error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    const stmt = db.prepare('DELETE FROM statistik WHERE id = ?');
    stmt.run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /api/statistik error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
