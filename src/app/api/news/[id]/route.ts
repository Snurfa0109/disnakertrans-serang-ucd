import { NextResponse } from 'next/server';
import { getNewsById, updateNews, deleteNews } from '@/lib/services/news.service';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * GET /api/news/:id
 * 
 * Get a single news item by ID.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsId = parseInt(id, 10);

    if (isNaN(newsId)) {
      return NextResponse.json(errorResponse('Invalid news ID'), { status: 400 });
    }

    const item = getNewsById(newsId);

    if (!item) {
      return NextResponse.json(errorResponse('News not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(item));
  } catch (error) {
    console.error('[API] GET /api/news/:id error:', error);
    return NextResponse.json(errorResponse('Failed to fetch news detail'), { status: 500 });
  }
}

/**
 * PUT /api/news/:id
 * 
 * Update a news item (admin).
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsId = parseInt(id, 10);

    if (isNaN(newsId)) {
      return NextResponse.json(errorResponse('Invalid news ID'), { status: 400 });
    }

    const body = await request.json();
    const updated = updateNews(newsId, body);

    if (!updated) {
      return NextResponse.json(errorResponse('News not found or no changes'), { status: 404 });
    }

    const item = getNewsById(newsId);
    return NextResponse.json(successResponse(item));
  } catch (error) {
    console.error('[API] PUT /api/news/:id error:', error);
    return NextResponse.json(errorResponse('Failed to update news'), { status: 500 });
  }
}

/**
 * DELETE /api/news/:id
 * 
 * Delete a news item (admin).
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsId = parseInt(id, 10);

    if (isNaN(newsId)) {
      return NextResponse.json(errorResponse('Invalid news ID'), { status: 400 });
    }

    const deleted = deleteNews(newsId);

    if (!deleted) {
      return NextResponse.json(errorResponse('News not found'), { status: 404 });
    }

    return NextResponse.json(successResponse({ message: 'Deleted successfully' }));
  } catch (error) {
    console.error('[API] DELETE /api/news/:id error:', error);
    return NextResponse.json(errorResponse('Failed to delete news'), { status: 500 });
  }
}
