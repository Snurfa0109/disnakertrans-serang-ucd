import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30'; // days
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Date boundaries
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(range));
    const startIso = startDate.toISOString();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().split('T')[0];

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthStr = monthAgo.toISOString().split('T')[0];

    // ─── OVERVIEW STATS ──────────────────────────────
    const [totVis] = await sql`SELECT COALESCE(SUM(count), 0) AS v FROM visitors`;
    const totalVisitors = Number(totVis?.v) || 0;

    const [uniqVis] = await sql`SELECT COUNT(DISTINCT visitor_id) AS v FROM visitor_logs`;
    const uniqueVisitors = Number(uniqVis?.v) || 0;

    const [todayVis] = await sql`SELECT COALESCE(count, 0) AS v FROM visitors WHERE date = ${today}`;
    const todayVisitors = Number(todayVis?.v) || 0;

    const [weekVis] = await sql`SELECT COALESCE(SUM(count), 0) AS v FROM visitors WHERE date >= ${weekStr}`;
    const weeklyVisitors = Number(weekVis?.v) || 0;

    const [monthVis] = await sql`SELECT COALESCE(SUM(count), 0) AS v FROM visitors WHERE date >= ${monthStr}`;
    const monthlyVisitors = Number(monthVis?.v) || 0;

    // Active users (last 5 min)
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const [activeRow] = await sql`SELECT COUNT(DISTINCT visitor_id) AS v FROM visitor_logs WHERE created_at >= ${fiveMinAgo}`;
    const activeUsers = Number(activeRow?.v) || 0;

    // ─── DAILY TRAFFIC (last N days) ──────────────────
    const dailyTraffic = await sql`
      SELECT date, count FROM visitors
      WHERE date >= ${startDate.toISOString().split('T')[0]} ORDER BY date ASC
    `;

    // ─── DEVICE BREAKDOWN ─────────────────────────────
    const deviceBreakdown = await sql`
      SELECT device, COUNT(*) AS count FROM visitor_logs
      WHERE created_at >= ${startIso} GROUP BY device ORDER BY count DESC
    `;

    // ─── BROWSER BREAKDOWN ────────────────────────────
    const browserBreakdown = await sql`
      SELECT browser, COUNT(*) AS count FROM visitor_logs
      WHERE created_at >= ${startIso} GROUP BY browser ORDER BY count DESC
    `;

    // ─── TRAFFIC SOURCE ───────────────────────────────
    const sourceBreakdown = await sql`
      SELECT referrer, COUNT(*) AS count FROM visitor_logs
      WHERE created_at >= ${startIso} AND referrer != 'Internal'
      GROUP BY referrer ORDER BY count DESC
    `;

    // ─── TOP PAGES ────────────────────────────────────
    const topPages = await sql`
      SELECT page_path, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS unique_visitors
      FROM visitor_logs WHERE created_at >= ${startIso}
      GROUP BY page_path ORDER BY views DESC LIMIT 10
    `;

    // ─── VISITOR LOGS (paginated) ─────────────────────
    const [logsTotalRow] = await sql`SELECT COUNT(*) AS c FROM visitor_logs WHERE created_at >= ${startIso}`;
    const logsTotal = Number(logsTotalRow?.c) || 0;

    const logs = await sql`
      SELECT id, visitor_id, ip_address, device, browser, os, page_path, referrer, session_duration, created_at
      FROM visitor_logs WHERE created_at >= ${startIso}
      ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
    `;

    // ─── OS BREAKDOWN ─────────────────────────────────
    const osBreakdown = await sql`
      SELECT os, COUNT(*) AS count FROM visitor_logs
      WHERE created_at >= ${startIso} GROUP BY os ORDER BY count DESC
    `;

    return NextResponse.json({
      overview: {
        totalVisitors,
        uniqueVisitors,
        todayVisitors,
        weeklyVisitors,
        monthlyVisitors,
        activeUsers,
      },
      dailyTraffic,
      deviceBreakdown,
      browserBreakdown,
      sourceBreakdown,
      osBreakdown,
      topPages,
      logs: {
        data: logs,
        total: logsTotal,
        page,
        limit,
        totalPages: Math.ceil(logsTotal / limit),
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
