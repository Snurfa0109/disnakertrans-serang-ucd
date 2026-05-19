/**
 * Complaint (Pengaduan) Service — Business logic layer.
 * 
 * Handles complaint submission, retrieval, status updates, and statistics.
 * Supports complaint types: "umum" | "hubungan_industrial"
 */

import db from '@/lib/db';
import cache from '@/lib/cache';

export interface Complaint {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'umum' | 'hubungan_industrial';
  status: 'pending' | 'processed';
  attachments: string;
  is_spam: number;
  date: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ComplaintInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
  type?: 'umum' | 'hubungan_industrial';
  attachments?: string;
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
  const { name, email, subject, message, type, attachments } = data;
  const date = new Date().toISOString();
  const complaintType = type || 'umum';

  const stmt = db.prepare(`
    INSERT INTO pengaduan (name, email, subject, message, type, status, attachments, date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, datetime('now'), datetime('now'))
  `);

  const info = stmt.run(name, email, subject || '', message, complaintType, attachments || '[]', date);
  const id = Number(info.lastInsertRowid);
  const ticketNumber = `#PKD-${String(id).padStart(5, '0')}`;

  // Invalidate cache
  cache.invalidateByPrefix('complaints:');

  return { id, ticketNumber };
}

/**
 * Get all complaints with optional status/type filter and pagination.
 */
export function getComplaints(params: {
  status?: 'pending' | 'processed';
  type?: 'umum' | 'hubungan_industrial';
  page?: number;
  perPage?: number;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(50, Math.max(1, params.perPage || 10));
  const offset = (page - 1) * perPage;

  const cacheKey = `complaints:list:${page}:${perPage}:${params.status || 'all'}:${params.type || 'all'}`;
  const cached = cache.get<{ items: Complaint[]; total: number }>(cacheKey);
  if (cached) return { ...cached, page, perPage };

  const conditions: string[] = [];
  const queryParams: (string | number)[] = [];

  if (params.status) {
    conditions.push('status = ?');
    queryParams.push(params.status);
  }

  if (params.type) {
    conditions.push('type = ?');
    queryParams.push(params.type);
  }

  const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM pengaduan${whereClause}`);
  const countRow = (queryParams.length > 0 ? countStmt.get(...queryParams) : countStmt.get()) as { total: number } | undefined;

  const total = countRow?.total || 0;

  const listStmt = db.prepare(
    `SELECT * FROM pengaduan${whereClause} ORDER BY date DESC LIMIT ? OFFSET ?`
  );
  const listParams = [...queryParams, perPage, offset];
  const items = listStmt.all(...listParams) as Complaint[];

  const result = { items, total };
  cache.set(cacheKey, result, 60);

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
 * Delete a complaint.
 */
export function deleteComplaint(id: number): boolean {
  const info = db.prepare('DELETE FROM pengaduan WHERE id = ?').run(id);
  cache.invalidateByPrefix('complaints:');
  return info.changes > 0;
}

/**
 * Mark complaint as spam or not.
 */
export function updateSpamStatus(id: number, isSpam: boolean): boolean {
  const stmt = db.prepare(`
    UPDATE pengaduan SET is_spam = ?, updated_at = datetime('now') WHERE id = ?
  `);
  const info = stmt.run(isSpam ? 1 : 0, id);
  if (info.changes > 0) cache.invalidateByPrefix('complaints:');
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
