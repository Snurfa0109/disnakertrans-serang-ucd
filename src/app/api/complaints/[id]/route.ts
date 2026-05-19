import { NextResponse } from 'next/server';
import {
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  updateSpamStatus,
} from '@/lib/services/complaint.service';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * GET /api/complaints/:id
 * 
 * Get a single complaint by ID.
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

    const item = getComplaintById(complaintId);

    if (!item) {
      return NextResponse.json(errorResponse('Complaint not found'), { status: 404 });
    }

    // Add ticket number to response
    const ticketNumber = `#PKD-${String(item.id).padStart(5, '0')}`;

    return NextResponse.json(
      successResponse({ ...item, ticketNumber })
    );
  } catch (error) {
    console.error('[API] GET /api/complaints/:id error:', error);
    return NextResponse.json(errorResponse('Failed to fetch complaint'), { status: 500 });
  }
}

/**
 * PATCH /api/complaints/:id
 * 
 * Update complaint status (pending → processed or vice versa).
 * Body: { status: "pending" | "processed" }
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

    const body = await request.json();
    const { status, is_spam } = body;

    // Check if complaint exists
    const existing = getComplaintById(complaintId);
    if (!existing) {
      return NextResponse.json(errorResponse('Complaint not found'), { status: 404 });
    }

    // Handle spam toggle
    if (is_spam !== undefined) {
      updateSpamStatus(complaintId, !!is_spam);
    }

    // Handle status update
    if (status && ['pending', 'processed'].includes(status)) {
      const updated = updateComplaintStatus(complaintId, status);
      if (!updated) {
        return NextResponse.json(errorResponse('Failed to update status'), { status: 500 });
      }
    }

    // Fetch updated record
    const updatedItem = getComplaintById(complaintId);
    const ticketNumber = `#PKD-${String(complaintId).padStart(5, '0')}`;

    return NextResponse.json(
      successResponse({
        ...updatedItem,
        ticketNumber,
        message: 'Pengaduan berhasil diperbarui',
      })
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
    const deleted = deleteComplaint(complaintId);
    if (!deleted) {
      return NextResponse.json(errorResponse('Complaint not found'), { status: 404 });
    }
    return NextResponse.json(successResponse({ message: 'Pengaduan berhasil dihapus' }));
  } catch (error) {
    console.error('[API] DELETE /api/complaints/:id error:', error);
    return NextResponse.json(errorResponse('Failed to delete complaint'), { status: 500 });
  }
}
