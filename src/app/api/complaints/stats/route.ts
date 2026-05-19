import { NextResponse } from 'next/server';
import { getComplaintStats } from '@/lib/services/complaint.service';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * GET /api/complaints/stats
 * 
 * Returns complaint statistics:
 * - total complaints
 * - total pending
 * - total processed
 */
export async function GET() {
  try {
    const stats = getComplaintStats();

    return NextResponse.json(
      successResponse(stats)
    );
  } catch (error) {
    console.error('[API] GET /api/complaints/stats error:', error);
    return NextResponse.json(errorResponse('Failed to fetch complaint statistics'), { status: 500 });
  }
}
