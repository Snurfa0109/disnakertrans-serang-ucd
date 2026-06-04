import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getComplaints, updateComplaint, deleteComplaint, getComplaintStats } from '@/lib/services/complaint.service';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * GET /api/admin/complaints
 * Admin: list complaints with full filtering + pagination
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  // Role-based filtering: hijamsostek only sees hubungan_industrial
  const userRole = session.user.role;
  let typeFilter = searchParams.get('type') || undefined;
  if (userRole === 'hijamsostek') {
    typeFilter = 'hubungan_industrial';
  } else if (userRole === 'sekretariat') {
    typeFilter = typeFilter || 'umum';
  }

  const result = getComplaints({
    status: (searchParams.get('status') as any) || undefined,
    type: (typeFilter as any) || undefined,
    search: searchParams.get('search') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    perPage: parseInt(searchParams.get('perPage') || '10'),
  });

  return NextResponse.json(
    successResponse(result.items, {
      total: result.total,
      page: result.page,
      perPage: result.perPage,
      totalPages: Math.ceil(result.total / result.perPage),
    })
  );
}

/**
 * PATCH /api/admin/complaints
 * Admin: update status, assign, internal notes
 */
export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, assigned_to, internal_notes, is_spam } = body;

    if (!id) {
      return NextResponse.json(errorResponse('ID diperlukan'), { status: 400 });
    }

    const updated = updateComplaint(Number(id), {
      ...(status !== undefined && { status }),
      ...(assigned_to !== undefined && { assigned_to }),
      ...(internal_notes !== undefined && { internal_notes }),
      ...(is_spam !== undefined && { is_spam }),
    });

    if (!updated) {
      return NextResponse.json(errorResponse('Pengaduan tidak ditemukan'), { status: 404 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';
    logAction({
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      action: 'status_change',
      module: 'complaints',
      targetId: id,
      targetDescription: status ? `Ubah status pengaduan #${id} → ${status}` : `Update pengaduan #${id}`,
      ipAddress: ip,
    });

    return NextResponse.json(successResponse({ message: 'Berhasil diperbarui' }));
  } catch (error) {
    console.error('[API] PATCH /api/admin/complaints error:', error);
    return NextResponse.json(errorResponse('Gagal memperbarui pengaduan'), { status: 500 });
  }
}

/**
 * DELETE /api/admin/complaints?id=<id>
 * Admin: delete a complaint
 */
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 403 });
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json(errorResponse('ID diperlukan'), { status: 400 });

  const deleted = deleteComplaint(Number(id));
  if (!deleted) return NextResponse.json(errorResponse('Tidak ditemukan'), { status: 404 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';
  logAction({
    actorId: session.user.id,
    actorName: session.user.name,
    actorRole: session.user.role,
    action: 'delete',
    module: 'complaints',
    targetId: id,
    targetDescription: `Hapus pengaduan #${id}`,
    ipAddress: ip,
  });

  return NextResponse.json(successResponse({ message: 'Pengaduan dihapus' }));
}
