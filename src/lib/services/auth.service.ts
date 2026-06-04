/**
 * Auth Service — handles admin user CRUD and session management.
 */

import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { AdminRole } from '@/lib/auth';

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  is_active: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// ─── SESSION ─────────────────────────────────────────────────

export function createSession(userId: number, ipAddress: string = ''): string {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 hours

  db.prepare(`
    INSERT INTO admin_sessions (user_id, token, ip_address, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(userId, token, ipAddress, expiresAt);

  // Update last_login
  db.prepare(`UPDATE admin_users SET last_login = datetime('now') WHERE id = ?`).run(userId);

  return token;
}

export function deleteSession(token: string): void {
  db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
}

export function cleanExpiredSessions(): void {
  db.prepare("DELETE FROM admin_sessions WHERE expires_at < datetime('now')").run();
}

// ─── ADMIN USERS ─────────────────────────────────────────────

export function getAdminUsers(params: {
  role?: string;
  search?: string;
  page?: number;
  perPage?: number;
} = {}): { items: AdminUserRow[]; total: number; page: number; perPage: number } {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(50, Math.max(1, params.perPage || 20));
  const offset = (page - 1) * perPage;

  const conditions: string[] = [];
  const queryParams: (string | number)[] = [];

  if (params.role) {
    conditions.push('role = ?');
    queryParams.push(params.role);
  }

  if (params.search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    queryParams.push(`%${params.search}%`, `%${params.search}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = (db.prepare(`SELECT COUNT(*) as c FROM admin_users ${where}`).get(...queryParams) as any)?.c || 0;
  const items = db.prepare(
    `SELECT id, name, email, role, is_active, last_login, created_at, updated_at 
     FROM admin_users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...queryParams, perPage, offset) as AdminUserRow[];

  return { items, total, page, perPage };
}

export function getAdminUserByEmail(email: string): (AdminUserRow & { password_hash: string }) | null {
  return db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email) as any || null;
}

export function getAdminUserById(id: number): AdminUserRow | null {
  return db.prepare(
    'SELECT id, name, email, role, is_active, last_login, created_at, updated_at FROM admin_users WHERE id = ?'
  ).get(id) as AdminUserRow | null;
}

export function createAdminUser(data: {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}): number {
  const hash = bcrypt.hashSync(data.password, 12);
  const info = db.prepare(`
    INSERT INTO admin_users (name, email, password_hash, role, is_active)
    VALUES (?, ?, ?, ?, 1)
  `).run(data.name, data.email.toLowerCase(), hash, data.role);
  return Number(info.lastInsertRowid);
}

export function updateAdminUser(id: number, data: Partial<{
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  is_active: number;
}>): boolean {
  const fields: string[] = [];
  const params: (string | number)[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name); }
  if (data.email !== undefined) { fields.push('email = ?'); params.push(data.email.toLowerCase()); }
  if (data.password !== undefined) {
    fields.push('password_hash = ?');
    params.push(bcrypt.hashSync(data.password, 12));
  }
  if (data.role !== undefined) { fields.push('role = ?'); params.push(data.role); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); params.push(data.is_active); }

  if (fields.length === 0) return false;

  fields.push("updated_at = datetime('now')");
  params.push(id);

  const info = db.prepare(`UPDATE admin_users SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  return info.changes > 0;
}

export function deleteAdminUser(id: number): boolean {
  // Delete sessions first
  db.prepare('DELETE FROM admin_sessions WHERE user_id = ?').run(id);
  const info = db.prepare('DELETE FROM admin_users WHERE id = ?').run(id);
  return info.changes > 0;
}

export function verifyPassword(plaintext: string, hash: string): boolean {
  return bcrypt.compareSync(plaintext, hash);
}
