import { NextResponse } from 'next/server';
import { getAdminUserByEmail, createSession, verifyPassword } from '@/lib/services/auth.service';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';
import { getClientIP } from '@/lib/auth';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';

/**
 * POST /api/auth/login
 * Authenticates admin user with email + password (bcrypt).
 */
export async function POST(request: Request) {
  try {
    // Rate Limiting: max 5 login attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(request, {
      prefix: 'admin_login',
      limit: 5,
      windowSeconds: 900,
    });

    if (!rateLimit.success) {
      const mins = Math.ceil(rateLimit.resetSeconds / 60);
      return createRateLimitResponse(
        rateLimit.resetSeconds,
        `Terlalu banyak percobaan login yang gagal. Akses ditangguhkan sementara selama ${mins} menit demi keamanan.`
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(errorResponse('Email dan password harus diisi'), { status: 400 });
    }

    const user = await getAdminUserByEmail(email.toLowerCase().trim());

    if (!user || !user.is_active) {
      return NextResponse.json(errorResponse('Email atau password salah'), { status: 401 });
    }

    const passwordValid = verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json(errorResponse('Email atau password salah'), { status: 401 });
    }

    const ip = getClientIP(request);
    const token = await createSession(user.id, ip);

    // Log login action (fire and forget)
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
