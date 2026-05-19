import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * GET /api/auth/check
 * 
 * Verify if admin session is valid.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json(errorResponse('Not authenticated'), { status: 401 });
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username] = decoded.split(':');
    const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';

    if (username !== ADMIN_USER) {
      return NextResponse.json(errorResponse('Invalid session'), { status: 401 });
    }

    return NextResponse.json(
      successResponse({ authenticated: true, user: { username, role: 'admin' } })
    );
  } catch {
    return NextResponse.json(errorResponse('Invalid session'), { status: 401 });
  }
}
