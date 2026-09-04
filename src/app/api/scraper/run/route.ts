import { NextResponse } from 'next/server';
import { scrapeNews, scrapeLowongan, scrapeTrainings, scrapeEvents } from '@/lib/scraper';
import { successResponse, errorResponse } from '@/lib/utils';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

/**
 * POST /api/scraper/run
 *
 * Manually trigger news, lowongan, trainings & events scraping run (admin only).
 * Query params:
 *   pages (default: 3, max: 18)
 *   reset=true  → deletes all scraped articles before re-scraping
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(errorResponse('Unauthorized: Sesi admin diperlukan'), { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const maxPages = Math.min(18, Math.max(1, parseInt(searchParams.get('pages') || '3', 10)));
    const reset = searchParams.get('reset') === 'true';

    if (reset) {
      const deleted = await sql`
        DELETE FROM news
        WHERE source_name = 'Disnakertrans Kab. Serang'
      `;
      console.log(`[Scraper API] Reset: deleted existing articles`);
    }

    console.log(`[Scraper API] Manual scrape triggered, max pages: ${maxPages}`);

    const [newsResult, lowonganResult, trainingsResult, eventsResult] = await Promise.all([
      scrapeNews(maxPages),
      scrapeLowongan(),
      scrapeTrainings(),
      scrapeEvents(),
    ]);

    return NextResponse.json(
      successResponse({
        newArticles: newsResult.newArticles,
        totalScraped: newsResult.totalScraped,
        lowonganCount: lowonganResult.count,
        trainingsCount: trainingsResult.count,
        eventsCount: eventsResult.count,
        errors: [...newsResult.errors, ...lowonganResult.errors, ...trainingsResult.errors, ...eventsResult.errors],
        message: `Scraping complete. ${newsResult.newArticles} articles, ${lowonganResult.count} lowongan, ${trainingsResult.count} pelatihan, ${eventsResult.count} events.`,
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
      usage: 'POST /api/scraper/run?pages=3  |  Add &reset=true to wipe old articles first',
    })
  );
}
