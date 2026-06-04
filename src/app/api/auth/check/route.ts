import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * GET /api/auth/check
 * Verifies current session and returns user info including role.
 */
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(errorResponse('Not authenticated'), { status: 401 });
  }

  return NextResponse.json(
    successResponse({
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
    })
  );
}
