import { NextResponse } from 'next/server';
import { getSession, getClientIP } from '@/lib/auth';
import { getFaqById, updateFaq, deleteFaq } from '@/lib/services/faq.service';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getFaqById(parseInt(id));
  if (!item) return NextResponse.json(errorResponse('FAQ tidak ditemukan'), { status: 404 });
  return NextResponse.json(successResponse(item));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  const { id } = await params;
  const faqId = parseInt(id);
  const body = await request.json();
  const updated = await updateFaq(faqId, body);

  if (!updated) return NextResponse.json(errorResponse('FAQ tidak ditemukan'), { status: 404 });

  logAction({
    actorId: session.user.id, actorName: session.user.name, actorRole: session.user.role,
    action: 'update', module: 'faq', targetId: faqId, ipAddress: getClientIP(request),
  });

  return NextResponse.json(successResponse({ message: 'FAQ diperbarui' }));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  const { id } = await params;
  const faqId = parseInt(id);
  const item = await getFaqById(faqId);
  const deleted = await deleteFaq(faqId);

  if (!deleted) return NextResponse.json(errorResponse('FAQ tidak ditemukan'), { status: 404 });

  logAction({
    actorId: session.user.id, actorName: session.user.name, actorRole: session.user.role,
    action: 'delete', module: 'faq', targetId: faqId,
    targetDescription: `FAQ: ${item?.question?.substring(0, 50)}`, ipAddress: getClientIP(request),
  });

  return NextResponse.json(successResponse({ message: 'FAQ dihapus' }));
}
