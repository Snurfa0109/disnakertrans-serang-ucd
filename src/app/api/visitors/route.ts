import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

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

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// GET — return actual total and today's visitor count directly from database
export async function GET() {
  try {
    const today = getTodayDate();
    const [totalRow] = await sql`SELECT COALESCE(SUM(count), 0) AS total FROM visitors`;
    const [todayRow] = await sql`SELECT COALESCE(count, 0) AS count FROM visitors WHERE date = ${today}`;

    const total = Number(totalRow?.total) || 0;
    const todayCount = Number(todayRow?.count) || 0;

    return NextResponse.json(
      { total, today: todayCount },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error('Error fetching visitor stats:', err);
    return NextResponse.json({ total: 0, today: 0 }, { headers: NO_CACHE_HEADERS });
  }
}

// POST — log a public visitor event with detailed info & return actual stats
export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const pagePath = body.page_path || '/';

    if (!isPublicPage(pagePath)) {
      return NextResponse.json({ error: 'Non-trackable path' }, { status: 400 });
    }

    if (!body.session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const today = getTodayDate();
    const sessionId = body.session_id;

    // Check duplicate visit within the last 15 seconds (prevents rapid multi-click/burst spam)
    const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000).toISOString().replace('T', ' ').substring(0, 19);
    const existing = await sql`
      SELECT id FROM visitor_logs 
      WHERE visitor_id = ${sessionId} AND page_path = ${pagePath} AND created_at >= ${fifteenSecondsAgo}
      LIMIT 1
    `;

    if (existing.length > 0) {
      const [totalRow] = await sql`SELECT COALESCE(SUM(count), 0) AS total FROM visitors`;
      const [todayRow] = await sql`SELECT COALESCE(count, 0) AS count FROM visitors WHERE date = ${today}`;
      return NextResponse.json(
        {
          total: Number(totalRow?.total) || 0,
          today: Number(todayRow?.count) || 0,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // Increment daily counter (MySQL syntax)
    try {
      await sql`
        INSERT INTO visitors (date, count) VALUES (${today}, 1)
        ON DUPLICATE KEY UPDATE count = count + 1
      `;
    } catch (e) {
      console.error('Error incrementing visitors table:', e);
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '0.0.0.0';

    // Mask IP for privacy
    const parts = ip.split('.');
    const maskedIp = parts.length === 4 ? `${parts[0]}.${parts[1]}.*.*` : ip;

    try {
      await sql`
        INSERT INTO visitor_logs (visitor_id, ip_address, device, browser, os, page_path, referrer, city)
        VALUES (
          ${sessionId}, ${maskedIp},
          ${body.device || 'Desktop'}, ${body.browser || 'Unknown'}, ${body.os || 'Unknown'},
          ${pagePath}, ${body.referrer || 'Direct'}, ${body.city || ''}
        )
      `;
    } catch (e) {
      console.error('Error inserting visitor_logs:', e);
    }

    // Return actual current stats from DB
    const [totalRow] = await sql`SELECT COALESCE(SUM(count), 0) AS total FROM visitors`;
    const [todayRow] = await sql`SELECT COALESCE(count, 0) AS count FROM visitors WHERE date = ${today}`;

    return NextResponse.json(
      {
        total: Number(totalRow?.total) || 0,
        today: Number(todayRow?.count) || 0,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error('POST /api/visitors error:', err);
    return NextResponse.json({ total: 0, today: 0 }, { headers: NO_CACHE_HEADERS });
  }
}
