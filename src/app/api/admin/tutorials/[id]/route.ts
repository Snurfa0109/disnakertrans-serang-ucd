import { NextResponse } from 'next/server';
import { getSession, getClientIP } from '@/lib/auth';
import { getTutorialById, updateTutorial, deleteTutorial } from '@/lib/services/tutorial.service';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getTutorialById(parseInt(id));
  if (!item) return NextResponse.json(errorResponse('Tutorial tidak ditemukan'), { status: 404 });
  return NextResponse.json(successResponse(item));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  const { id } = await params;
  const tutId = parseInt(id);
  const body = await request.json();
  const updated = updateTutorial(tutId, body);

  if (!updated) return NextResponse.json(errorResponse('Tutorial tidak ditemukan'), { status: 404 });

  logAction({
    actorId: session.user.id, actorName: session.user.name, actorRole: session.user.role,
    action: 'update', module: 'tutorials', targetId: tutId, ipAddress: getClientIP(request),
  });

  return NextResponse.json(successResponse({ message: 'Tutorial diperbarui' }));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  const { id } = await params;
  const tutId = parseInt(id);
  const item = getTutorialById(tutId);
  const deleted = deleteTutorial(tutId);

  if (!deleted) return NextResponse.json(errorResponse('Tutorial tidak ditemukan'), { status: 404 });

  logAction({
    actorId: session.user.id, actorName: session.user.name, actorRole: session.user.role,
    action: 'delete', module: 'tutorials', targetId: tutId,
    targetDescription: `Tutorial: ${item?.title}`, ipAddress: getClientIP(request),
  });

  return NextResponse.json(successResponse({ message: 'Tutorial dihapus' }));
}
