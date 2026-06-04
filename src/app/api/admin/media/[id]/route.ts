import { NextResponse } from 'next/server';
import { getSession, getClientIP } from '@/lib/auth';
import { getMediaById, deleteMedia } from '@/lib/services/media.service';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  const { id } = await params;
  const item = deleteMedia(parseInt(id));
  if (!item) return NextResponse.json(errorResponse('Media tidak ditemukan'), { status: 404 });

  // Delete the physical file
  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', item.filename);
    await unlink(filePath);
  } catch {
    // Ignore if file already gone
  }

  logAction({
    actorId: session.user.id, actorName: session.user.name, actorRole: session.user.role,
    action: 'delete', module: 'media', targetId: parseInt(id),
    targetDescription: `File: ${item.original_name}`, ipAddress: getClientIP(request),
  });

  return NextResponse.json(successResponse({ message: 'Media dihapus' }));
}
