import { NextResponse } from 'next/server';
import { getSession, getClientIP } from '@/lib/auth';
import { getAuditLogs } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const result = getAuditLogs({
    actorId: searchParams.get('actorId') ? parseInt(searchParams.get('actorId')!) : undefined,
    action: searchParams.get('action') || undefined,
    module: searchParams.get('module') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    perPage: parseInt(searchParams.get('perPage') || '20'),
  });

  return NextResponse.json(successResponse(result.items, {
    total: result.total, page: result.page, perPage: result.perPage,
    totalPages: Math.ceil(result.total / result.perPage),
  }));
}
