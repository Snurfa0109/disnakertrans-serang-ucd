/**
 * Next.js Instrumentation
 * 
 * This file is loaded when the Next.js server starts.
 * Used to initialize the cron scheduler for automatic news scraping.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run the scheduler on the server side (not during build/edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startScheduler } = await import('@/lib/scheduler');
    startScheduler();
    console.log('[Instrumentation] Cron scheduler initialized');
  }
}
