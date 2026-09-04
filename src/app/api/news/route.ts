import { NextResponse } from 'next/server';
import { getNewsList, createNews } from '@/lib/services/news.service';
import { successResponse, errorResponse } from '@/lib/utils';
import { getSession } from '@/lib/auth';

/**
 * GET /api/news
 * 
 * Paginated news listing with optional filters.
 * Query params: page, perPage, category, search (alias: q)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || searchParams.get('q') || undefined;

    const result = await getNewsList({ page, perPage, category, search });

    return NextResponse.json(
      successResponse(result.items, {
        total: result.total,
        page: result.page,
        perPage: result.perPage,
        totalPages: Math.ceil(result.total / result.perPage),
      })
    );
  } catch (error) {
    console.error('[API] GET /api/news error:', error);
    return NextResponse.json(errorResponse('Failed to fetch news'), { status: 500 });
  }
}

/**
 * POST /api/news
 * 
 * Create a news item manually (admin only).
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(errorResponse('Unauthorized: Sesi admin diperlukan'), { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, content, thumbnail, category, date, link_url } = body;

    if (!title || !description || !date) {
      return NextResponse.json(
        errorResponse('Missing required fields: title, description, date'),
        { status: 400 }
      );
    }

    const id = await createNews({
      title,
      description,
      content: content || '',
      thumbnail: thumbnail || '',
      category: category || 'Umum',
      date,
      link_url: link_url || '',
    });

    return NextResponse.json(
      successResponse({ id, ...body }),
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] POST /api/news error:', error);
    return NextResponse.json(errorResponse('Failed to create news'), { status: 500 });
  }
}
