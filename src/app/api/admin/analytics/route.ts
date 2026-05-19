import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

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
    const startStr = startDate.toISOString().split('T')[0];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().split('T')[0];

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthStr = monthAgo.toISOString().split('T')[0];

    // ─── OVERVIEW STATS ──────────────────────────────
    const totalVisitors = (db.prepare('SELECT COALESCE(SUM(count), 0) as v FROM visitors').get() as any)?.v || 0;
    const uniqueVisitors = (db.prepare('SELECT COUNT(DISTINCT visitor_id) as v FROM visitor_logs').get() as any)?.v || 0;
    const todayVisitors = (db.prepare('SELECT COALESCE(count, 0) as v FROM visitors WHERE date = ?').get(today) as any)?.v || 0;
    const weeklyVisitors = (db.prepare('SELECT COALESCE(SUM(count), 0) as v FROM visitors WHERE date >= ?').get(weekStr) as any)?.v || 0;
    const monthlyVisitors = (db.prepare('SELECT COALESCE(SUM(count), 0) as v FROM visitors WHERE date >= ?').get(monthStr) as any)?.v || 0;

    // Active users (last 5 min)
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
    const activeUsers = (db.prepare('SELECT COUNT(DISTINCT visitor_id) as v FROM visitor_logs WHERE created_at >= ?').get(fiveMinAgo) as any)?.v || 0;

    // ─── DAILY TRAFFIC (last N days) ──────────────────
    const dailyTraffic = db.prepare(`
      SELECT date, count FROM visitors 
      WHERE date >= ? ORDER BY date ASC
    `).all(startStr) as any[];

    // ─── DEVICE BREAKDOWN ─────────────────────────────
    const deviceBreakdown = db.prepare(`
      SELECT device, COUNT(*) as count FROM visitor_logs 
      WHERE created_at >= ? GROUP BY device ORDER BY count DESC
    `).all(startStr + ' 00:00:00') as any[];

    // ─── BROWSER BREAKDOWN ────────────────────────────
    const browserBreakdown = db.prepare(`
      SELECT browser, COUNT(*) as count FROM visitor_logs 
      WHERE created_at >= ? GROUP BY browser ORDER BY count DESC
    `).all(startStr + ' 00:00:00') as any[];

    // ─── TRAFFIC SOURCE ───────────────────────────────
    const sourceBreakdown = db.prepare(`
      SELECT referrer, COUNT(*) as count FROM visitor_logs 
      WHERE created_at >= ? AND referrer != 'Internal' GROUP BY referrer ORDER BY count DESC
    `).all(startStr + ' 00:00:00') as any[];

    // ─── TOP PAGES ────────────────────────────────────
    const topPages = db.prepare(`
      SELECT page_path, COUNT(*) as views, COUNT(DISTINCT visitor_id) as unique_visitors
      FROM visitor_logs WHERE created_at >= ?
      GROUP BY page_path ORDER BY views DESC LIMIT 10
    `).all(startStr + ' 00:00:00') as any[];

    // ─── VISITOR LOGS (paginated) ─────────────────────
    const logsTotal = (db.prepare('SELECT COUNT(*) as c FROM visitor_logs WHERE created_at >= ?').get(startStr + ' 00:00:00') as any)?.c || 0;
    const logs = db.prepare(`
      SELECT id, visitor_id, ip_address, device, browser, os, page_path, referrer, session_duration, created_at
      FROM visitor_logs WHERE created_at >= ?
      ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(startStr + ' 00:00:00', limit, offset) as any[];

    // ─── OS BREAKDOWN ─────────────────────────────────
    const osBreakdown = db.prepare(`
      SELECT os, COUNT(*) as count FROM visitor_logs 
      WHERE created_at >= ? GROUP BY os ORDER BY count DESC
    `).all(startStr + ' 00:00:00') as any[];

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
