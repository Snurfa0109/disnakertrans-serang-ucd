/**
 * Next.js Instrumentation
 *
 * This file is loaded when the Next.js server starts.
 * Used to:
 *   1. Initialize the MySQL database (create tables + seed data)
 *   2. Start the cron scheduler for automatic news scraping.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on the server side (not during build/edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { initDb } = await import('./lib/db');
      await initDb();
      console.log('[Instrumentation] Database initialized');
    } catch (err) {
      console.error('[Instrumentation] Database init failed:', err);
    }

    try {
      const { startScheduler } = await import('./lib/scheduler');
      startScheduler();
      console.log('[Instrumentation] Cron scheduler initialized');
    } catch (err) {
      console.error('[Instrumentation] Scheduler init failed:', err);
    }
  }
}

