/**
 * Auth helpers for server-side use (API routes).
 * Provides session validation and role-based access control.
 */

import { cookies } from 'next/headers';
import db from '@/lib/db';

export type AdminRole = 'superadmin' | 'website' | 'sekretariat' | 'lattas' | 'binapenta' | 'hijamsostek';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  is_active: number;
}

export interface SessionData {
  user: AdminUser;
  sessionId: number;
}

// ─── Role Permission Map ──────────────────────────────────────
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  superadmin: ['*'], // full access
  website: ['dashboard', 'news', 'faq', 'tutorials', 'content', 'media', 'chatbot', 'analytics'],
  sekretariat: ['dashboard', 'complaints_umum', 'content_public', 'media'],
  lattas: ['dashboard', 'news_lattas', 'faq_lattas', 'jadwal', 'data'],
  binapenta: ['dashboard', 'news_binapenta', 'faq_binapenta', 'lowongan', 'data'],
  hijamsostek: ['dashboard', 'news_hijamsostek', 'faq_hijamsostek', 'complaints_hi', 'layanan_hi'],
};

/**
 * Get the current session from the cookie.
 * Returns null if session is invalid or expired.
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) return null;

    const row = db.prepare(`
      SELECT s.id as sessionId, s.expires_at,
             u.id, u.name, u.email, u.role, u.is_active
      FROM admin_sessions s
      JOIN admin_users u ON u.id = s.user_id
      WHERE s.token = ? AND u.is_active = 1
    `).get(token) as (AdminUser & { sessionId: number; expires_at: string }) | undefined;

    if (!row) return null;

    // Check expiry
    if (new Date(row.expires_at) < new Date()) {
      // Clean up expired session
      db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
      return null;
    }

    return {
      sessionId: row.sessionId,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role as AdminRole,
        is_active: row.is_active,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Check if the session user has access to a given permission.
 * Super admins have full access to everything.
 */
export function hasPermission(role: AdminRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

/**
 * Get client IP from request headers.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
