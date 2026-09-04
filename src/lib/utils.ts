/**
 * Generate a URL-friendly slug from a string.
 * Handles Indonesian characters and special cases.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except whitespace and hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
}

/**
 * Generate a summary from the full content text.
 * Extracts the first ~200 characters of meaningful text.
 */
export function generateSummary(content: string, maxLength = 200): string {
  // Strip any remaining HTML tags
  const text = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;

  // Cut at the last space before maxLength to avoid breaking words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

/**
 * Clean HTML content, keeping only safe text content.
 * Removes scripts, styles, and other dangerous elements.
 */
export function cleanContent(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remove inline event handlers
    .replace(/style="[^"]*"/gi, '') // Remove inline styles
    .trim();
}

/**
 * Parse an Indonesian date string like "04 March 2026" into an ISO date.
 */
export function parseIndonesianDate(dateStr: string): string {
  try {
    // Try standard parsing first
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    // Fall through to manual parsing
  }

  // Manual month mapping for Indonesian date formats
  const months: Record<string, number> = {
    january: 0, februari: 1, february: 1, maret: 2, march: 2,
    april: 3, mei: 4, may: 4, juni: 5, june: 5,
    juli: 6, july: 6, agustus: 7, august: 7,
    september: 8, oktober: 9, october: 9,
    november: 10, desember: 11, december: 11,
  };

  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = months[parts[1].toLowerCase()];
    const year = parseInt(parts[2], 10);

    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day).toISOString();
    }
  }

  return new Date().toISOString(); // Fallback to now
}

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    [key: string]: any;
  };
  message?: string;
}

export function successResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta']
): ApiResponse<T> {
  return { status: 'success', data, ...(meta ? { meta } : {}) };
}

export function errorResponse(message: string): ApiResponse<null> {
  return { status: 'error', data: null, message };
}

/**
 * Category-based fallback thumbnail image helper.
 * Ensures every news card always has a high-quality relevant image.
 */
export function getCategoryFallbackImage(category?: string | null): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('lattas') || cat.includes('pelatihan')) {
    return 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80';
  }
  if (cat.includes('hi') || cat.includes('jamsostek') || cat.includes('thr')) {
    return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80';
  }
  if (cat.includes('binapenta') || cat.includes('lapor') || cat.includes('lowongan')) {
    return 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop&q=80';
  }
  if (cat.includes('sekretariat') || cat.includes('korupsi')) {
    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80';
  }
  return '/images/banner-beranda.png';
}
