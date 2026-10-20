import { NextResponse } from 'next/server';
import { closeSession, getSession } from '@/lib/services/livechat.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, rating, feedback } = body;

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        message: 'Parameter sessionId diperlukan',
      }, { status: 400 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Sesi chat tidak ditemukan',
      }, { status: 404 });
    }

    await closeSession(sessionId, rating ? Number(rating) : undefined, feedback);
    const updated = await getSession(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Sesi chat berhasil ditutup',
      session: updated,
    });
  } catch (error) {
    console.error('[API livechat/rate POST] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
