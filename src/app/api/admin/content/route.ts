import { NextResponse } from 'next/server';
import { getSession, getClientIP } from '@/lib/auth';
import { getSiteContent, bulkSetSiteContent } from '@/lib/services/content.service';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section') || undefined;
  const items = getSiteContent(section);
  return NextResponse.json(successResponse(items));
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(errorResponse('Format tidak valid'), { status: 400 });
    }

    bulkSetSiteContent(items, session.user.id);

    logAction({
      actorId: session.user.id, actorName: session.user.name, actorRole: session.user.role,
      action: 'update', module: 'content', targetDescription: `Update ${items.length} konten website`,
      ipAddress: getClientIP(request),
    });

    return NextResponse.json(successResponse({ message: 'Konten berhasil disimpan' }));
  } catch (error) {
    console.error('[API] PUT /api/admin/content error:', error);
    return NextResponse.json(errorResponse('Gagal menyimpan konten'), { status: 500 });
  }
}
