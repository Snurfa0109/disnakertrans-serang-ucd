import { NextResponse } from 'next/server';
import { getSession, getClientIP } from '@/lib/auth';
import { getFaqs, createFaq } from '@/lib/services/faq.service';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await getFaqs({
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
    const { question, answer, category, status, sort_order } = body;

    if (!question?.trim() || !answer?.trim() || !category) {
      return NextResponse.json(errorResponse('Pertanyaan, jawaban, dan kategori wajib diisi'), { status: 400 });
    }

    const id = await createFaq({ question: question.trim(), answer: answer.trim(), category, status, sort_order, created_by: session.user.id });

    logAction({
      actorId: session.user.id, actorName: session.user.name, actorRole: session.user.role,
      action: 'create', module: 'faq', targetId: id, targetDescription: `FAQ: ${question.substring(0, 50)}`,
      ipAddress: getClientIP(request),
    });

    return NextResponse.json(successResponse({ id }), { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/admin/faq error:', error);
    return NextResponse.json(errorResponse('Gagal membuat FAQ'), { status: 500 });
  }
}
