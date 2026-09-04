import { NextResponse } from 'next/server';
import { searchNews } from '@/lib/services/news.service';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * GET /api/news/search?q=keyword
 * 
 * Search news by title with pagination.
 * Query params: q (required), page, perPage
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json(
        errorResponse('Search query "q" is required'),
        { status: 400 }
      );
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);

    const result = await searchNews(query, page, perPage);

    return NextResponse.json(
      successResponse(result.items, {
        total: result.total,
        page: result.page,
        perPage: result.perPage,
        totalPages: Math.ceil(result.total / result.perPage),
      })
    );
  } catch (error) {
    console.error('[API] GET /api/news/search error:', error);
    return NextResponse.json(errorResponse('Failed to search news'), { status: 500 });
  }
}
