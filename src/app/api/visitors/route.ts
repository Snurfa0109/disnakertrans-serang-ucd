import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

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
    const [totalRow] = await sql`SELECT COALESCE(SUM(count), 0) AS total FROM visitors`;
    const [todayRow] = await sql`SELECT COALESCE(count, 0) AS count FROM visitors WHERE date = ${today}`;

    return NextResponse.json({
      total: Number(totalRow?.total) || 0,
      today: Number(todayRow?.count) || 0,
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

    if (!isPublicPage(pagePath)) {
      return NextResponse.json({ error: 'Non-trackable path' }, { status: 400 });
    }

    if (!body.session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const today = getTodayDate();
    const sessionId = body.session_id;

    // Check duplicate visit in current session
    const existing = await sql`
      SELECT id FROM visitor_logs 
      WHERE visitor_id = ${sessionId} AND page_path = ${pagePath} AND created_at >= ${today + ' 00:00:00'}
      LIMIT 1
    `;

    if (existing.length > 0) {
      const [totalRow] = await sql`SELECT COALESCE(SUM(count), 0) AS total FROM visitors`;
      const [todayRow] = await sql`SELECT count FROM visitors WHERE date = ${today}`;
      return NextResponse.json({ total: Number(totalRow?.total) || 0, today: Number(todayRow?.count) || 0 });
    }

    // Increment daily counter (MySQL syntax)
    await sql`
      INSERT INTO visitors (date, count) VALUES (${today}, 1)
      ON DUPLICATE KEY UPDATE count = count + 1
    `;

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '0.0.0.0';

    // Mask IP for privacy
    const parts = ip.split('.');
    const maskedIp = parts.length === 4 ? `${parts[0]}.${parts[1]}.*.*` : ip;

    await sql`
      INSERT INTO visitor_logs (visitor_id, ip_address, device, browser, os, page_path, referrer, city)
      VALUES (
        ${sessionId}, ${maskedIp},
        ${body.device || 'Desktop'}, ${body.browser || 'Unknown'}, ${body.os || 'Unknown'},
        ${pagePath}, ${body.referrer || 'Direct'}, ${body.city || ''}
      )
    `;

    // Return current stats
    const [totalRow] = await sql`SELECT COALESCE(SUM(count), 0) AS total FROM visitors`;
    const [todayRow] = await sql`SELECT count FROM visitors WHERE date = ${today}`;

    return NextResponse.json({
      total: Number(totalRow?.total) || 0,
      today: Number(todayRow?.count) || 0,
    });
  } catch {
    return NextResponse.json({ total: 0, today: 0 });
  }
}
