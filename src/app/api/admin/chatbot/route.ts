import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import sql from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = 10;
  const offset = (page - 1) * perPage;

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);
  const daysAgoIso = daysAgo.toISOString();

  // Overview stats
  const [statsRow] = await sql`
    SELECT 
      COUNT(*) AS total_sessions,
      COALESCE(SUM(fallback_count), 0) AS total_fallbacks,
      COALESCE(SUM(message_count), 0) AS total_messages
    FROM chatbot_logs
    WHERE created_at >= ${daysAgoIso}
  `;

  const totalSessions = Number(statsRow?.total_sessions) || 0;
  const totalFallbacks = Number(statsRow?.total_fallbacks) || 0;
  const totalMessages = Number(statsRow?.total_messages) || 0;

  // Most asked questions (top last_query)
  const topQueries = await sql`
    SELECT last_query, COUNT(*) AS count
    FROM chatbot_logs
    WHERE last_query != '' AND created_at >= ${daysAgoIso}
    GROUP BY last_query
    ORDER BY count DESC
    LIMIT 10
  `;

  // Daily trend
  const dailyTrend = await sql`
    SELECT DATE(created_at) AS date, COUNT(*) AS sessions, SUM(fallback_count) AS fallbacks
    FROM chatbot_logs
    WHERE created_at >= ${daysAgoIso}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  // Recent conversations
  const [countRow] = await sql`SELECT COUNT(*) AS c FROM chatbot_logs`;
  const total = Number(countRow?.c) || 0;
  const recentConversations = await sql`
    SELECT * FROM chatbot_logs ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${offset}
  `;

  return NextResponse.json(successResponse({
    overview: {
      totalSessions,
      totalMessages,
      totalFallbacks,
      avgMessagesPerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0,
      fallbackRate: totalMessages > 0 ? Math.round((totalFallbacks / totalMessages) * 100) : 0,
    },
    topQueries,
    dailyTrend,
    recentConversations,
    pagination: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  }));
}

/** POST /api/admin/chatbot — log a chatbot session (called from Chatbot.tsx) */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, messages, fallback_count, last_query } = body;

    if (!session_id) return NextResponse.json(errorResponse('session_id required'), { status: 400 });

    const existing = await sql`SELECT id FROM chatbot_logs WHERE session_id = ${session_id}`;

    if (existing.length > 0) {
      await sql`
        UPDATE chatbot_logs
        SET messages = ${JSON.stringify(messages || [])}, message_count = ${(messages || []).length},
            fallback_count = ${fallback_count || 0}, last_query = ${last_query || ''}, updated_at = NOW()
        WHERE session_id = ${session_id}
      `;
    } else {
      await sql`
        INSERT INTO chatbot_logs (session_id, messages, message_count, fallback_count, last_query)
        VALUES (${session_id}, ${JSON.stringify(messages || [])}, ${(messages || []).length}, ${fallback_count || 0}, ${last_query || ''})
      `;
    }

    return NextResponse.json(successResponse({ logged: true }));
  } catch (error) {
    console.error('[Chatbot] Log error:', error);
    return NextResponse.json(errorResponse('Failed to log'), { status: 500 });
  }
}
