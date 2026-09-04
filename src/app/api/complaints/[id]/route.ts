import { NextResponse } from 'next/server';
import {
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  updateSpamStatus,
} from '@/lib/services/complaint.service';
import { getSession, getClientIP } from '@/lib/auth';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * GET /api/complaints/:id
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaintId = parseInt(id, 10);

    if (isNaN(complaintId)) {
      return NextResponse.json(errorResponse('Invalid complaint ID'), { status: 400 });
    }

    const item = await getComplaintById(complaintId);
    if (!item) {
      return NextResponse.json(errorResponse('Complaint not found'), { status: 404 });
    }

    const ticketNumber = item.ticket_number || `PKD-${String(item.id).padStart(5, '0')}`;
    return NextResponse.json(successResponse({ ...item, ticketNumber }));
  } catch (error) {
    console.error('[API] GET /api/complaints/:id error:', error);
    return NextResponse.json(errorResponse('Failed to fetch complaint'), { status: 500 });
  }
}

/**
 * PATCH /api/complaints/:id
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaintId = parseInt(id, 10);

    if (isNaN(complaintId)) {
      return NextResponse.json(errorResponse('Invalid complaint ID'), { status: 400 });
    }

    const existing = await getComplaintById(complaintId);
    if (!existing) {
      return NextResponse.json(errorResponse('Complaint not found'), { status: 404 });
    }

    const body = await request.json();
    const { status, is_spam, internal_notes, assigned_to } = body;

    // Handle spam toggle
    if (is_spam !== undefined) {
      await updateSpamStatus(complaintId, Boolean(is_spam));
    }

    // Handle status update — support both new and legacy values
    if (status) {
      let resolvedStatus: string = status;
      if (status === 'pending') resolvedStatus = 'Diproses';
      else if (status === 'processed') resolvedStatus = 'Selesai';
      await updateComplaint(complaintId, { status: resolvedStatus });
    }

    if (internal_notes !== undefined) {
      await updateComplaint(complaintId, { internal_notes });
    }

    if (assigned_to !== undefined) {
      await updateComplaint(complaintId, { assigned_to });
    }

    // Audit log
    try {
      const session = await getSession();
      if (session) {
        logAction({
          actorId: session.user.id,
          actorName: session.user.name,
          actorRole: session.user.role,
          action: status ? 'status_change' : 'update',
          module: 'complaints',
          targetId: complaintId,
          targetDescription: status
            ? `Status: ${existing.status} → ${status} (Tiket: ${existing.ticket_number || complaintId})`
            : `Update pengaduan ${existing.ticket_number || complaintId}`,
          ipAddress: getClientIP(request),
        });
      }
    } catch { /* audit fail shouldn't break the API */ }

    const updatedItem = await getComplaintById(complaintId);
    const ticketNumber = updatedItem?.ticket_number || `PKD-${String(complaintId).padStart(5, '0')}`;

    return NextResponse.json(
      successResponse({ ...updatedItem, ticketNumber, message: 'Pengaduan berhasil diperbarui' })
    );
  } catch (error) {
    console.error('[API] PATCH /api/complaints/:id error:', error);
    return NextResponse.json(errorResponse('Failed to update complaint'), { status: 500 });
  }
}

/**
 * DELETE /api/complaints/:id
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaintId = parseInt(id, 10);
    if (isNaN(complaintId)) {
      return NextResponse.json(errorResponse('Invalid complaint ID'), { status: 400 });
    }

    const item = await getComplaintById(complaintId);
    const deleted = await deleteComplaint(complaintId);
    if (!deleted) {
      return NextResponse.json(errorResponse('Complaint not found'), { status: 404 });
    }

    try {
      const session = await getSession();
      if (session) {
        logAction({
          actorId: session.user.id, actorName: session.user.name, actorRole: session.user.role,
          action: 'delete', module: 'complaints', targetId: complaintId,
          targetDescription: `Hapus pengaduan ${item?.ticket_number || complaintId}: ${item?.subject || ''}`,
          ipAddress: getClientIP(request),
        });
      }
    } catch { /* audit fail shouldn't break */ }

    return NextResponse.json(successResponse({ message: 'Pengaduan berhasil dihapus' }));
  } catch (error) {
    console.error('[API] DELETE /api/complaints/:id error:', error);
    return NextResponse.json(errorResponse('Failed to delete complaint'), { status: 500 });
  }
}
