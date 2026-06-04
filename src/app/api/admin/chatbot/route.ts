import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import db from '@/lib/db';
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

  // Overview stats
  const totalSessions = (db.prepare(`
    SELECT COUNT(*) as c FROM chatbot_logs 
    WHERE created_at >= datetime('now', '-${days} days')
  `).get() as any)?.c || 0;

  const totalFallbacks = (db.prepare(`
    SELECT SUM(fallback_count) as c FROM chatbot_logs 
    WHERE created_at >= datetime('now', '-${days} days')
  `).get() as any)?.c || 0;

  const totalMessages = (db.prepare(`
    SELECT SUM(message_count) as c FROM chatbot_logs 
    WHERE created_at >= datetime('now', '-${days} days')
  `).get() as any)?.c || 0;

  // Most asked questions (top last_query)
  const topQueries = db.prepare(`
    SELECT last_query, COUNT(*) as count 
    FROM chatbot_logs 
    WHERE last_query != '' AND created_at >= datetime('now', '-${days} days')
    GROUP BY last_query 
    ORDER BY count DESC 
    LIMIT 10
  `).all() as { last_query: string; count: number }[];

  // Daily trend
  const dailyTrend = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as sessions, SUM(fallback_count) as fallbacks
    FROM chatbot_logs
    WHERE created_at >= datetime('now', '-${days} days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).all() as { date: string; sessions: number; fallbacks: number }[];

  // Recent conversations
  const total = (db.prepare(`SELECT COUNT(*) as c FROM chatbot_logs`).get() as any)?.c || 0;
  const recentConversations = db.prepare(`
    SELECT * FROM chatbot_logs ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(perPage, offset) as any[];

  return NextResponse.json(successResponse({
    overview: {
      totalSessions,
      totalMessages: totalMessages || 0,
      totalFallbacks: totalFallbacks || 0,
      avgMessagesPerSession: totalSessions > 0 ? Math.round((totalMessages || 0) / totalSessions) : 0,
      fallbackRate: totalMessages > 0 ? Math.round(((totalFallbacks || 0) / totalMessages) * 100) : 0,
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

    const existing = db.prepare('SELECT id FROM chatbot_logs WHERE session_id = ?').get(session_id) as any;

    if (existing) {
      db.prepare(`
        UPDATE chatbot_logs 
        SET messages = ?, message_count = ?, fallback_count = ?, last_query = ?, updated_at = datetime('now')
        WHERE session_id = ?
      `).run(
        JSON.stringify(messages || []),
        (messages || []).length,
        fallback_count || 0,
        last_query || '',
        session_id
      );
    } else {
      db.prepare(`
        INSERT INTO chatbot_logs (session_id, messages, message_count, fallback_count, last_query)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        session_id,
        JSON.stringify(messages || []),
        (messages || []).length,
        fallback_count || 0,
        last_query || ''
      );
    }

    return NextResponse.json(successResponse({ logged: true }));
  } catch (error) {
    console.error('[Chatbot] Log error:', error);
    return NextResponse.json(errorResponse('Failed to log'), { status: 500 });
  }
}
