/**
 * Auth Service — handles admin user CRUD and session management.
 */

import sql from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { AdminRole } from '@/lib/auth';

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export async function createSession(userId: number, ipAddress: string = ''): Promise<string> {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 hours

  await sql`
    INSERT INTO admin_sessions (user_id, token, ip_address, expires_at)
    VALUES (${userId}, ${token}, ${ipAddress}, ${expiresAt})
  `;

  // Update last_login
  await sql`UPDATE admin_users SET last_login = NOW() WHERE id = ${userId}`;

  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await sql`DELETE FROM admin_sessions WHERE token = ${token}`;
}

export async function cleanExpiredSessions(): Promise<void> {
  await sql`DELETE FROM admin_sessions WHERE expires_at < NOW()`;
}

export async function getAdminUsers(params: {
  role?: string;
  search?: string;
  page?: number;
  perPage?: number;
} = {}): Promise<{ items: AdminUserRow[]; total: number; page: number; perPage: number }> {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(50, Math.max(1, params.perPage || 20));
  const offset = (page - 1) * perPage;

  // Build dynamic WHERE clause
  const conditions: string[] = [];
  const queryValues: (string | number)[] = [];

  if (params.role) {
    conditions.push('role = ?');
    queryValues.push(params.role);
  }
  if (params.search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    queryValues.push(`%${params.search}%`, `%${params.search}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await sql.unsafe(
    `SELECT COUNT(*) AS c FROM admin_users ${where}`,
    queryValues
  );
  const total = Number(countResult[0]?.c) || 0;

  const listValues = [...queryValues, perPage, offset];
  const items = await sql.unsafe(
    `SELECT id, name, email, role, is_active, last_login, created_at, updated_at
     FROM admin_users ${where} ORDER BY created_at DESC
     LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
    listValues
  ) as AdminUserRow[];

  return { items, total, page, perPage };
}

export async function getAdminUserByEmail(email: string): Promise<(AdminUserRow & { password_hash: string }) | null> {
  const rows = await sql`SELECT * FROM admin_users WHERE email = ${email}`;
  return (rows[0] as any) || null;
}

export async function getAdminUserById(id: number): Promise<AdminUserRow | null> {
  const rows = await sql`
    SELECT id, name, email, role, is_active, last_login, created_at, updated_at
    FROM admin_users WHERE id = ${id}
  `;
  return (rows[0] as AdminUserRow) || null;
}

export async function createAdminUser(data: {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}): Promise<number> {
  const hash = bcrypt.hashSync(data.password, 12);
  const result = await sql`
    INSERT INTO admin_users (name, email, password_hash, role, is_active)
    VALUES (${data.name}, ${data.email.toLowerCase()}, ${hash}, ${data.role}, TRUE)
    RETURNING id
  `;
  return Number(result[0].id);
}

export async function updateAdminUser(id: number, data: Partial<{
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  is_active: boolean;
}>): Promise<boolean> {
  const fields: string[] = [];
  const params: (string | number | boolean)[] = [];

  if (data.name !== undefined)     { fields.push(`name = $${params.length + 1}`);          params.push(data.name); }
  if (data.email !== undefined)    { fields.push(`email = $${params.length + 1}`);         params.push(data.email.toLowerCase()); }
  if (data.password !== undefined) { fields.push(`password_hash = $${params.length + 1}`); params.push(bcrypt.hashSync(data.password, 12)); }
  if (data.role !== undefined)     { fields.push(`role = $${params.length + 1}`);          params.push(data.role); }
  if (data.is_active !== undefined){ fields.push(`is_active = $${params.length + 1}`);     params.push(data.is_active); }

  if (fields.length === 0) return false;

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await sql.unsafe(
    `UPDATE admin_users SET ${fields.join(', ')} WHERE id = $${params.length}`,
    params
  );
  return result.count > 0;
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  await sql`DELETE FROM admin_sessions WHERE user_id = ${id}`;
  const result = await sql`DELETE FROM admin_users WHERE id = ${id}`;
  return result.count > 0;
}

export function verifyPassword(plaintext: string, hash: string): boolean {
  return bcrypt.compareSync(plaintext, hash);
}
