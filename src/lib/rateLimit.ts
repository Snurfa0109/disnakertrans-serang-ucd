/**
 * Rate Limiter for Next.js Route Handlers
 *
 * In-memory sliding window rate limiter to protect public API endpoints
 * (like complaints submission and captcha validation) from bot abuse and spam.
 */

import { NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class MemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private sweepInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodically sweep expired entries every 5 minutes to prevent memory leak
    if (typeof setInterval !== 'undefined') {
      this.sweepInterval = setInterval(() => this.sweep(), 5 * 60 * 1000);
      if (this.sweepInterval.unref) {
        this.sweepInterval.unref();
      }
    }
  }

  private sweep() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Check and increment hit count for a given identifier
   */
  limit(key: string, maxHits = 5, windowSeconds = 600): {
    success: boolean;
    limit: number;
    remaining: number;
    resetSeconds: number;
  } {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const record = this.store.get(key);

    if (!record || now > record.resetAt) {
      // First hit or window expired
      this.store.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });

      return {
        success: true,
        limit: maxHits,
        remaining: maxHits - 1,
        resetSeconds: windowSeconds,
      };
    }

    // Existing active window
    if (record.count >= maxHits) {
      const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
      return {
        success: false,
        limit: maxHits,
        remaining: 0,
        resetSeconds,
      };
    }

    record.count += 1;
    const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

    return {
      success: true,
      limit: maxHits,
      remaining: maxHits - record.count,
      resetSeconds,
    };
  }
}

// Global singleton instance
const globalLimiter = new MemoryRateLimiter();

/**
 * Helper to safely extract client IP from Next.js / Node Request
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Can be comma-separated list: "client, proxy1, proxy2"
    const clientIp = forwardedFor.split(',')[0].trim();
    if (clientIp) return clientIp;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  return '127.0.0.1';
}

export interface RateLimitOptions {
  limit?: number;        // Max allowed requests in the window (default: 5)
  windowSeconds?: number; // Time window in seconds (default: 600s / 10 mins)
  prefix?: string;       // Key prefix, e.g. "complaint"
}

/**
 * Check rate limit for an incoming request
 */
export function checkRateLimit(request: Request, options: RateLimitOptions = {}) {
  const ip = getClientIp(request);
  const prefix = options.prefix || 'api';
  const key = `${prefix}:${ip}`;

  const limit = options.limit ?? 5;
  const windowSeconds = options.windowSeconds ?? 600;

  const result = globalLimiter.limit(key, limit, windowSeconds);

  return {
    ...result,
    ip,
    headers: {
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(result.resetSeconds),
    },
  };
}

/**
 * Helper to create a standardized 429 Too Many Requests response
 */
export function createRateLimitResponse(resetSeconds: number, customMessage?: string) {
  const minutes = Math.ceil(resetSeconds / 60);
  const message = customMessage || 
    `Terlalu banyak permintaan dari perangkat Anda. Silakan tunggu ${minutes} menit sebelum mencoba kembali.`;

  return NextResponse.json(
    {
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message,
      retryAfterSeconds: resetSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(resetSeconds),
        'X-RateLimit-Reset': String(resetSeconds),
      },
    }
  );
}
