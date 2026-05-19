/**
 * Cron Scheduler
 * 
 * Automatically runs the news scraper every 8 hours.
 * Uses node-cron for scheduling within the Next.js server process.
 * 
 * Import this module in the app's instrumentation file to start the scheduler.
 */

import cron from 'node-cron';
import { scrapeNews } from '@/lib/scraper';

let isSchedulerRunning = false;
let lastRunAt: string | null = null;
let lastResult: { newArticles: number; totalScraped: number; errors: string[] } | null = null;

/**
 * Start the cron scheduler.
 * Runs scraper every 8 hours: at 00:00, 08:00, and 16:00.
 */
export function startScheduler() {
  if (isSchedulerRunning) {
    console.log('[Scheduler] Already running, skipping duplicate start');
    return;
  }

  // Run every 8 hours: "0 0,8,16 * * *"
  const schedule = process.env.SCRAPE_CRON || '0 0,8,16 * * *';

  cron.schedule(schedule, async () => {
    console.log(`[Scheduler] Cron triggered at ${new Date().toISOString()}`);

    try {
      const maxPages = parseInt(process.env.SCRAPE_MAX_PAGES || '3', 10);
      const result = await scrapeNews(maxPages);

      lastRunAt = new Date().toISOString();
      lastResult = result;

      console.log(`[Scheduler] Completed — ${result.newArticles} new articles`);
    } catch (error) {
      console.error('[Scheduler] Scraping failed:', error);
      lastRunAt = new Date().toISOString();
      lastResult = {
        newArticles: 0,
        totalScraped: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  });

  isSchedulerRunning = true;
  console.log(`[Scheduler] Started with schedule: ${schedule}`);

  // Run an initial scrape on startup (after a 10-second delay to let the server boot)
  if (process.env.SCRAPE_ON_STARTUP === 'true') {
    setTimeout(async () => {
      console.log('[Scheduler] Running initial startup scrape...');
      try {
        const result = await scrapeNews(2);
        lastRunAt = new Date().toISOString();
        lastResult = result;
      } catch (error) {
        console.error('[Scheduler] Startup scrape failed:', error);
      }
    }, 10_000);
  }
}

/**
 * Get the scheduler status for monitoring.
 */
export function getSchedulerStatus() {
  return {
    running: isSchedulerRunning,
    lastRunAt,
    lastResult,
    schedule: process.env.SCRAPE_CRON || '0 0,8,16 * * *',
  };
}
