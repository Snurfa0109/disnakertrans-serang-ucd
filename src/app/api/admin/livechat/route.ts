import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { 
  getAdminSessions, 
  getSession as getLiveChatSession, 
  getMessages, 
  sendMessage, 
  assignSession, 
  closeSession 
} from '@/lib/services/livechat.service';
import sql from '@/lib/db';

/**
 * GET /api/admin/livechat
 * Query params: status (all, waiting, active, closed), search, sessionId
 */
export async function GET(request: NextRequest) {
  try {
    const adminSession = await getSession();
    if (!adminSession) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    // If specific sessionId requested, return its detail and messages
    if (sessionId) {
      const session = await getLiveChatSession(sessionId);
      if (!session) {
        return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 });
      }
      const messages = await getMessages(sessionId);
      return NextResponse.json({
        success: true,
        session,
        messages,
      });
    }

    // Otherwise list all sessions
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    const result = await getAdminSessions({ status, search });

    return NextResponse.json({
      success: true,
      ...result,
      currentUser: {
        name: adminSession.user.name,
        email: adminSession.user.email,
        role: adminSession.user.role,
      },
    });
  } catch (error) {
    console.error('[API admin/livechat GET] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/livechat
 * Petugas sends a message to citizen
 */
export async function POST(request: NextRequest) {
  try {
    const adminSession = await getSession();
    if (!adminSession) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, message } = body;

    if (!sessionId || !message || !message.trim()) {
      return NextResponse.json({ success: false, message: 'sessionId and message are required' }, { status: 400 });
    }

    const session = await getLiveChatSession(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 });
    }

    const petugasName = adminSession.user.name || 'Petugas Disnakertrans';

    const newMessage = await sendMessage({
      sessionId,
      senderType: 'petugas',
      senderName: petugasName,
      message: message.trim(),
    });

    // Auto assign if unassigned
    if (!session.assigned_petugas) {
      await assignSession(sessionId, petugasName);
    }

    const updatedSession = await getLiveChatSession(sessionId);

    return NextResponse.json({
      success: true,
      message: newMessage,
      session: updatedSession,
    });
  } catch (error) {
    console.error('[API admin/livechat POST] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/livechat
 * Manage session: assign, close, reopen
 */
export async function PATCH(request: NextRequest) {
  try {
    const adminSession = await getSession();
    if (!adminSession) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, action, petugasName } = body;

    if (!sessionId || !action) {
      return NextResponse.json({ success: false, message: 'sessionId and action are required' }, { status: 400 });
    }

    const session = await getLiveChatSession(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 });
    }

    if (action === 'assign') {
      const assigned = petugasName || adminSession.user.name || 'Petugas Disnakertrans';
      await assignSession(sessionId, assigned);
      await sendMessage({
        sessionId,
        senderType: 'system',
        senderName: 'Sistem Disnakertrans',
        message: `Chat ini telah diambil alih oleh ${assigned} (Petugas Piket Disnakertrans Serang).`,
      });
    } else if (action === 'close') {
      await closeSession(sessionId);
    } else if (action === 'reopen') {
      await sql`
        UPDATE livechat_sessions 
        SET status = 'active', updated_at = NOW() 
        WHERE session_id = ${sessionId}
      `;
      await sendMessage({
        sessionId,
        senderType: 'system',
        senderName: 'Sistem Disnakertrans',
        message: 'Sesi konsultasi ini telah dibuka kembali oleh petugas.',
      });
    }

    const updatedSession = await getLiveChatSession(sessionId);
    const messages = await getMessages(sessionId);

    return NextResponse.json({
      success: true,
      session: updatedSession,
      messages,
    });
  } catch (error) {
    console.error('[API admin/livechat PATCH] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
