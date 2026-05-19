import { NextResponse } from 'next/server';
import { getSchedulerStatus } from '@/lib/scheduler';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * GET /api/scraper/status
 * 
 * Check cron scheduler status and last run info.
 */
export async function GET() {
  try {
    const status = getSchedulerStatus();
    return NextResponse.json(successResponse(status));
  } catch (error) {
    console.error('[API] GET /api/scraper/status error:', error);
    return NextResponse.json(errorResponse('Failed to get scheduler status'), { status: 500 });
  }
}
