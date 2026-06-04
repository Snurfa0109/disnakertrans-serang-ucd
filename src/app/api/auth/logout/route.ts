import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/services/auth.service';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/services/audit.service';
import { successResponse } from '@/lib/utils';

/**
 * POST /api/auth/logout
 * Deletes the session from the database and clears the cookie.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (token) {
    // Log before deleting session
    const session = await getSession();
    if (session) {
      logAction({
        actorId: session.user.id,
        actorName: session.user.name,
        actorRole: session.user.role,
        action: 'logout',
        module: 'auth',
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '',
      });
    }
    deleteSession(token);
  }

  const response = NextResponse.json(successResponse({ message: 'Logout berhasil' }));

  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
