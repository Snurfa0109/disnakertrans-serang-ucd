import { NextResponse } from 'next/server';
import { getSession, getClientIP } from '@/lib/auth';
import { getAdminUserById, updateAdminUser, deleteAdminUser } from '@/lib/services/auth.service';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';

/** PATCH /api/admin/users/[id] — update admin user */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 403 });
  }

  const { id } = await params;
  const userId = parseInt(id);
  if (isNaN(userId)) return NextResponse.json(errorResponse('Invalid ID'), { status: 400 });

  try {
    const body = await request.json();
    const { name, email, password, role, is_active } = body;

    // Prevent super admin from deactivating themselves
    if (userId === session.user.id && is_active === 0) {
      return NextResponse.json(errorResponse('Tidak dapat menonaktifkan akun sendiri'), { status: 400 });
    }

    const updated = updateAdminUser(userId, {
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.trim() }),
      ...(password !== undefined && password.length >= 8 && { password }),
      ...(role !== undefined && { role }),
      ...(is_active !== undefined && { is_active }),
    });

    if (!updated) return NextResponse.json(errorResponse('Admin tidak ditemukan'), { status: 404 });

    logAction({
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      action: 'update',
      module: 'users',
      targetId: userId,
      targetDescription: `Update akun admin ID ${userId}`,
      ipAddress: getClientIP(request),
    });

    return NextResponse.json(successResponse({ message: 'Admin berhasil diperbarui' }));
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE')) {
      return NextResponse.json(errorResponse('Email sudah digunakan'), { status: 409 });
    }
    return NextResponse.json(errorResponse('Gagal memperbarui admin'), { status: 500 });
  }
}

/** DELETE /api/admin/users/[id] */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 403 });
  }

  const { id } = await params;
  const userId = parseInt(id);

  if (userId === session.user.id) {
    return NextResponse.json(errorResponse('Tidak dapat menghapus akun sendiri'), { status: 400 });
  }

  const user = getAdminUserById(userId);
  const deleted = deleteAdminUser(userId);
  if (!deleted) return NextResponse.json(errorResponse('Admin tidak ditemukan'), { status: 404 });

  logAction({
    actorId: session.user.id,
    actorName: session.user.name,
    actorRole: session.user.role,
    action: 'delete',
    module: 'users',
    targetId: userId,
    targetDescription: `Hapus akun admin: ${user?.email}`,
    ipAddress: getClientIP(request),
  });

  return NextResponse.json(successResponse({ message: 'Admin berhasil dihapus' }));
}
