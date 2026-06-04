import { NextResponse } from 'next/server';
import { getAdminUserByEmail, createSession, verifyPassword } from '@/lib/services/auth.service';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';
import { getClientIP } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Authenticates admin user with email + password (bcrypt).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(errorResponse('Email dan password harus diisi'), { status: 400 });
    }

    const user = getAdminUserByEmail(email.toLowerCase().trim());

    if (!user || !user.is_active) {
      return NextResponse.json(errorResponse('Email atau password salah'), { status: 401 });
    }

    const passwordValid = verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json(errorResponse('Email atau password salah'), { status: 401 });
    }

    const ip = getClientIP(request);
    const token = createSession(user.id, ip);

    // Log login action
    logAction({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'login',
      module: 'auth',
      targetDescription: `Login dari IP ${ip}`,
      ipAddress: ip,
    });

    const response = NextResponse.json(
      successResponse({
        message: 'Login berhasil',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      })
    );

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[API] POST /api/auth/login error:', error);
    return NextResponse.json(errorResponse('Login gagal'), { status: 500 });
  }
}
