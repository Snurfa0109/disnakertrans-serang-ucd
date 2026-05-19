import { NextResponse } from 'next/server';
import { scrapeNews } from '@/lib/scraper';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * POST /api/scraper/run
 * 
 * Manually trigger a news scraping run.
 * Query params: pages (default: 3, max: 18)
 * 
 * Protected: In production, you'd add auth middleware here.
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const maxPages = Math.min(18, Math.max(1, parseInt(searchParams.get('pages') || '3', 10)));

    console.log(`[Scraper API] Manual scrape triggered, max pages: ${maxPages}`);

    const result = await scrapeNews(maxPages);

    return NextResponse.json(
      successResponse({
        newArticles: result.newArticles,
        totalScraped: result.totalScraped,
        errors: result.errors,
        message: `Scraping complete. ${result.newArticles} new articles added.`,
      })
    );
  } catch (error) {
    console.error('[API] POST /api/scraper/run error:', error);
    return NextResponse.json(
      errorResponse('Scraper failed: ' + (error instanceof Error ? error.message : String(error))),
      { status: 500 }
    );
  }
}

/**
 * GET /api/scraper/run
 * 
 * Check scraper status / health.
 */
export async function GET() {
  return NextResponse.json(
    successResponse({
      status: 'ready',
      message: 'Send a POST request to trigger scraping',
      usage: 'POST /api/scraper/run?pages=3',
    })
  );
}
