import { NextResponse } from 'next/server';
import { getSession, getClientIP } from '@/lib/auth';
import { getAdminUsers, createAdminUser } from '@/lib/services/auth.service';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';
import type { AdminRole } from '@/lib/auth';

/** GET /api/admin/users — list all admin users (Super Admin only) */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const result = getAdminUsers({
    role: searchParams.get('role') || undefined,
    search: searchParams.get('search') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    perPage: parseInt(searchParams.get('perPage') || '20'),
  });

  return NextResponse.json(successResponse(result.items, {
    total: result.total, page: result.page, perPage: result.perPage,
    totalPages: Math.ceil(result.total / result.perPage),
  }));
}

/** POST /api/admin/users — create new admin user (Super Admin only) */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
      return NextResponse.json(errorResponse('Semua field wajib diisi'), { status: 400 });
    }

    const validRoles: AdminRole[] = ['superadmin', 'website', 'sekretariat', 'lattas', 'binapenta', 'hijamsostek'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(errorResponse('Role tidak valid'), { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(errorResponse('Password minimal 8 karakter'), { status: 400 });
    }

    const id = createAdminUser({ name: name.trim(), email: email.trim(), password, role });

    logAction({
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      action: 'create',
      module: 'users',
      targetId: id,
      targetDescription: `Membuat akun admin: ${email} (${role})`,
      ipAddress: getClientIP(request),
    });

    return NextResponse.json(successResponse({ id, message: 'Admin berhasil dibuat' }), { status: 201 });
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE')) {
      return NextResponse.json(errorResponse('Email sudah digunakan'), { status: 409 });
    }
    console.error('[API] POST /api/admin/users error:', error);
    return NextResponse.json(errorResponse('Gagal membuat admin'), { status: 500 });
  }
}
