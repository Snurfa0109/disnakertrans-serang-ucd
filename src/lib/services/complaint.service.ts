/**
 * Complaint (Pengaduan) Service — Business logic layer.
 * 
 * Handles complaint submission, retrieval, status updates, and statistics.
 */

import db from '@/lib/db';
import cache from '@/lib/cache';

export interface Complaint {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'processed';
  date: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ComplaintInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  processed: number;
}

/**
 * Submit a new complaint. Returns the created complaint's ID.
 */
export function createComplaint(data: ComplaintInput): {
  id: number;
  ticketNumber: string;
} {
  const { name, email, subject, message } = data;
  const date = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO pengaduan (name, email, subject, message, status, date, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', ?, datetime('now'), datetime('now'))
  `);

  const info = stmt.run(name, email, subject || '', message, date);
  const id = Number(info.lastInsertRowid);
  const ticketNumber = `#PKD-${String(id).padStart(5, '0')}`;

  // Invalidate cache
  cache.invalidateByPrefix('complaints:');

  return { id, ticketNumber };
}

/**
 * Get all complaints with optional status filter and pagination.
 */
export function getComplaints(params: {
  status?: 'pending' | 'processed';
  page?: number;
  perPage?: number;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(50, Math.max(1, params.perPage || 10));
  const offset = (page - 1) * perPage;

  const cacheKey = `complaints:list:${page}:${perPage}:${params.status || 'all'}`;
  const cached = cache.get<{ items: Complaint[]; total: number }>(cacheKey);
  if (cached) return { ...cached, page, perPage };

  let whereClause = '';
  const queryParams: (string | number)[] = [];

  if (params.status) {
    whereClause = ' WHERE status = ?';
    queryParams.push(params.status);
  }

  const countRow = db.prepare(
    `SELECT COUNT(*) as total FROM pengaduan${whereClause}`
  ).get(...queryParams) as { total: number } | undefined;

  const total = countRow?.total || 0;

  const items = db.prepare(
    `SELECT * FROM pengaduan${whereClause} ORDER BY date DESC LIMIT ? OFFSET ?`
  ).all(...[...queryParams, perPage, offset]) as Complaint[];

  const result = { items, total };
  cache.set(cacheKey, result, 60); // 1-minute cache

  return { ...result, page, perPage };
}

/**
 * Get a single complaint by ID.
 */
export function getComplaintById(id: number): Complaint | null {
  const item = db.prepare('SELECT * FROM pengaduan WHERE id = ?').get(id) as Complaint | undefined;
  return item || null;
}

/**
 * Update complaint status (pending → processed).
 */
export function updateComplaintStatus(
  id: number,
  status: 'pending' | 'processed'
): boolean {
  const stmt = db.prepare(`
    UPDATE pengaduan SET status = ?, updated_at = datetime('now') WHERE id = ?
  `);

  const info = stmt.run(status, id);

  if (info.changes > 0) {
    cache.invalidateByPrefix('complaints:');
  }

  return info.changes > 0;
}

/**
 * Get complaint statistics.
 */
export function getComplaintStats(): ComplaintStats {
  const cacheKey = 'complaints:stats';
  const cached = cache.get<ComplaintStats>(cacheKey);
  if (cached) return cached;

  const total = (db.prepare('SELECT COUNT(*) as count FROM pengaduan').get() as { count: number })?.count || 0;
  const pending = (db.prepare("SELECT COUNT(*) as count FROM pengaduan WHERE status = 'pending'").get() as { count: number })?.count || 0;
  const processed = (db.prepare("SELECT COUNT(*) as count FROM pengaduan WHERE status = 'processed'").get() as { count: number })?.count || 0;

  const stats = { total, pending, processed };
  cache.set(cacheKey, stats, 60);

  return stats;
}
