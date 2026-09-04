import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const items = await sql`SELECT * FROM statistik ORDER BY sort_order ASC`;
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[API] GET /api/statistik error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Sesi admin diperlukan' }, { status: 401 });
  }

  try {
    const { label, value, description } = await request.json();
    await sql`INSERT INTO statistik (label, value, description) VALUES (${label}, ${value}, ${description || ''})`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] POST /api/statistik error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Sesi admin diperlukan' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items } = body; // array of { id, label, value, description }

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Items must be an array' }, { status: 400 });
    }

    await sql.begin(async (tx) => {
      for (const row of items) {
        await tx`
          UPDATE statistik 
          SET label = ${row.label}, value = ${row.value}, description = ${row.description || ''}, updated_at = NOW()
          WHERE id = ${row.id}
        `;
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] PUT /api/statistik error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Sesi admin diperlukan' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    await sql`DELETE FROM statistik WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /api/statistik error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
