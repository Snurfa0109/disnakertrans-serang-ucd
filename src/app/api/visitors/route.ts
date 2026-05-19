import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Paths that must NEVER be counted as visitor traffic
const BLOCKED_PREFIXES = ['/admin', '/api', '/_next'];
const BLOCKED_EXTENSIONS = ['.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.js', '.woff', '.woff2', '.webp'];

function isPublicPage(path: string): boolean {
  if (!path || path.trim() === '') return false;
  if (BLOCKED_PREFIXES.some(p => path.startsWith(p))) return false;
  if (BLOCKED_EXTENSIONS.some(ext => path.endsWith(ext))) return false;
  return true;
}

// GET — return total and today's visitor count (for public footer)
export async function GET() {
  try {
    const today = getTodayDate();
    const totalRow = db.prepare('SELECT COALESCE(SUM(count), 0) as total FROM visitors').get() as any;
    const todayRow = db.prepare('SELECT COALESCE(count, 0) as count FROM visitors WHERE date = ?').get(today) as any;

    return NextResponse.json({
      total: totalRow?.total || 0,
      today: todayRow?.count || 0,
    });
  } catch {
    return NextResponse.json({ total: 0, today: 0 });
  }
}

// POST — log a public visitor event with detailed info
export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const pagePath = body.page_path || '/';

    // ─── SERVER-SIDE VALIDATION ────────────────────────
    // Reject non-public pages (admin, API, static assets)
    if (!isPublicPage(pagePath)) {
      return NextResponse.json({ error: 'Non-trackable path' }, { status: 400 });
    }

    // Require session_id to prevent legacy/malformed requests
    if (!body.session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const today = getTodayDate();
    const sessionId = body.session_id;

    // ─── SESSION DEDUP (server-side) ───────────────────
    // Check if this session already visited this page today
    const existing = db.prepare(
      'SELECT id FROM visitor_logs WHERE visitor_id = ? AND page_path = ? AND created_at >= ? LIMIT 1'
    ).get(sessionId, pagePath, today + ' 00:00:00') as any;

    if (existing) {
      // Already tracked — skip to prevent inflation
      const totalRow = db.prepare('SELECT COALESCE(SUM(count), 0) as total FROM visitors').get() as any;
      const todayRow = db.prepare('SELECT count FROM visitors WHERE date = ?').get(today) as any;
      return NextResponse.json({ total: totalRow?.total || 0, today: todayRow?.count || 0 });
    }

    // ─── INCREMENT DAILY COUNTER ───────────────────────
    db.prepare(`
      INSERT INTO visitors (date, count) VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET count = count + 1
    `).run(today);

    // ─── LOG DETAILED VISIT ────────────────────────────
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '0.0.0.0';

    // Mask IP for privacy
    const parts = ip.split('.');
    const maskedIp = parts.length === 4 ? `${parts[0]}.${parts[1]}.*.*` : ip;

    db.prepare(`
      INSERT INTO visitor_logs (visitor_id, ip_address, device, browser, os, page_path, referrer, city)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      maskedIp,
      body.device || 'Desktop',
      body.browser || 'Unknown',
      body.os || 'Unknown',
      pagePath,
      body.referrer || 'Direct',
      body.city || ''
    );

    // Return current stats
    const totalRow = db.prepare('SELECT COALESCE(SUM(count), 0) as total FROM visitors').get() as any;
    const todayRow = db.prepare('SELECT count FROM visitors WHERE date = ?').get(today) as any;

    return NextResponse.json({
      total: totalRow?.total || 0,
      today: todayRow?.count || 0,
    });
  } catch {
    return NextResponse.json({ total: 0, today: 0 });
  }
}
