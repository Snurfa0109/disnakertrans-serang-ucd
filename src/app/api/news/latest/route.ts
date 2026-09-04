import { NextResponse } from 'next/server';
import { getLatestNews } from '@/lib/services/news.service';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * GET /api/news/latest
 * 
 * Returns the latest 3–6 news items for the homepage.
 * Query params: limit (default: 6, max: 10)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '6', 10)));

    const items = await getLatestNews(limit);

    return NextResponse.json(
      successResponse(items, {
        total: items.length,
        page: 1,
        perPage: limit,
        totalPages: 1,
      })
    );
  } catch (error) {
    console.error('[API] GET /api/news/latest error:', error);
    return NextResponse.json(errorResponse('Failed to fetch latest news'), { status: 500 });
  }
}
