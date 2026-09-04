import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

function isValidPreviewUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

    const hostname = parsed.hostname.toLowerCase();
    // Block loopback, private IPs, and cloud metadata service
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '169.254.169.254' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const rawUrl = searchParams.get('url');

  let targetUrl = rawUrl;

  if (id) {
    try {
      const rows = await sql`SELECT file_url FROM dokumen_publik WHERE id = ${Number(id)} LIMIT 1`;
      if (rows.length > 0) {
        targetUrl = rows[0].file_url;
      }
    } catch (err) {
      console.error('[API] /api/dokumen/preview DB error:', err);
    }
  }

  if (!targetUrl) {
    return new NextResponse('URL Dokumen tidak ditemukan', { status: 404 });
  }

  // If targetUrl is local path in /uploads/...
  if (targetUrl.startsWith('/')) {
    return NextResponse.redirect(new URL(targetUrl, req.url));
  }

  // SSRF Protection: Validate external URL
  if (!isValidPreviewUrl(targetUrl)) {
    return new NextResponse('Akses URL eksternal tidak diizinkan', { status: 400 });
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!upstreamRes.ok) {
      // If upstream failed or timed out, redirect to original URL so browser handles it or shows download prompt
      return NextResponse.redirect(targetUrl);
    }

    const contentType = upstreamRes.headers.get('content-type') || 'application/pdf';
    const buffer = await upstreamRes.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType.includes('pdf') ? 'application/pdf' : contentType,
        'Content-Disposition': 'inline',
        'X-Frame-Options': 'SAMEORIGIN',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.warn('[API] /api/dokumen/preview proxy timeout/error, redirecting:', err);
    // Fallback: redirect directly to the target URL
    return NextResponse.redirect(targetUrl);
  }
}
