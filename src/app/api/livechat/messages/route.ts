import { NextResponse } from 'next/server';
import { 
  getMessages, 
  sendMessage, 
  getSession 
} from '@/lib/services/livechat.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const afterId = parseInt(searchParams.get('afterId') || '0', 10);

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

    const messages = await getMessages(sessionId, afterId);

    return NextResponse.json({
      success: true,
      session,
      messages,
    });
  } catch (error) {
    console.error('[API livechat/messages GET] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, senderType, senderName, message } = body;

    if (!sessionId || !message || !message.trim()) {
      return NextResponse.json({
        success: false,
        message: 'SessionId dan pesan tidak boleh kosong',
      }, { status: 400 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Sesi chat tidak ditemukan',
      }, { status: 404 });
    }

    const newMessage = await sendMessage({
      sessionId,
      senderType: senderType || 'citizen',
      senderName: senderName || (senderType === 'petugas' ? 'Petugas Disnakertrans' : session.citizen_name),
      message: message.trim(),
    });

    const updatedSession = await getSession(sessionId);

    return NextResponse.json({
      success: true,
      message: newMessage,
      session: updatedSession,
    });
  } catch (error) {
    console.error('[API livechat/messages POST] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
