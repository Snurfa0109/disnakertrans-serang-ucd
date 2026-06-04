import { NextResponse } from 'next/server';
import { getSession, getClientIP } from '@/lib/auth';
import { getTutorials, createTutorial } from '@/lib/services/tutorial.service';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = getTutorials({
    category: searchParams.get('category') || undefined,
    status: (searchParams.get('status') as any) || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    perPage: parseInt(searchParams.get('perPage') || '20'),
  });
  return NextResponse.json(successResponse(result.items, {
    total: result.total, page: result.page, perPage: result.perPage,
    totalPages: Math.ceil(result.total / result.perPage),
  }));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  try {
    const body = await request.json();
    const { title, slug, category, thumbnail, steps, estimated_duration, cta_link, cta_text, status } = body;

    if (!title?.trim() || !category) {
      return NextResponse.json(errorResponse('Judul dan kategori wajib diisi'), { status: 400 });
    }

    const finalSlug = slug?.trim() || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const id = createTutorial({
      title: title.trim(), slug: finalSlug, category,
      thumbnail, steps: steps || [],
      estimated_duration: estimated_duration || '5 menit',
      cta_link, cta_text, status,
      created_by: session.user.id,
    });

    logAction({
      actorId: session.user.id, actorName: session.user.name, actorRole: session.user.role,
      action: 'create', module: 'tutorials', targetId: id, targetDescription: `Tutorial: ${title}`,
      ipAddress: getClientIP(request),
    });

    return NextResponse.json(successResponse({ id }), { status: 201 });
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE')) {
      return NextResponse.json(errorResponse('Slug sudah digunakan'), { status: 409 });
    }
    return NextResponse.json(errorResponse('Gagal membuat tutorial'), { status: 500 });
  }
}
