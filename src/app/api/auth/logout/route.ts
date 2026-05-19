import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/utils';

/**
 * POST /api/auth/logout
 */
export async function POST() {
  const response = NextResponse.json(
    successResponse({ message: 'Logout berhasil' })
  );

  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
