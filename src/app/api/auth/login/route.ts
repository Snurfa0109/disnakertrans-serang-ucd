import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * POST /api/auth/login
 * 
 * Simple admin authentication.
 * In production, use proper hashing (bcrypt) and JWT tokens.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        errorResponse('Username dan password harus diisi'),
        { status: 400 }
      );
    }

    // Admin credentials — in production, store hashed in DB
    const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'disnaker2024';

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      return NextResponse.json(
        errorResponse('Username atau password salah'),
        { status: 401 }
      );
    }

    // Generate a simple session token
    const token = Buffer.from(`${ADMIN_USER}:${Date.now()}`).toString('base64');

    const response = NextResponse.json(
      successResponse({
        message: 'Login berhasil',
        user: { username: ADMIN_USER, role: 'admin' },
      })
    );

    // Set cookie
    response.cookies.set('admin_token', token, {
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
