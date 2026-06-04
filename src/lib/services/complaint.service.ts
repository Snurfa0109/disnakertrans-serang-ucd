/**
 * Complaint (Pengaduan) Service — Business logic layer.
 * Upgraded with full status lifecycle, ticket numbers, assignment, internal notes.
 */

import db from '@/lib/db';
import cache from '@/lib/cache';

export type ComplaintStatus = 'Baru' | 'Diproses' | 'Menunggu Tindak Lanjut' | 'Selesai' | 'Ditolak';
export const COMPLAINT_STATUSES: ComplaintStatus[] = ['Baru', 'Diproses', 'Menunggu Tindak Lanjut', 'Selesai', 'Ditolak'];

export interface Complaint {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'umum' | 'hubungan_industrial';
  status: ComplaintStatus;
  ticket_number: string;
  assigned_to: number | null;
  internal_notes: string;
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
  baru: number;
  diproses: number;
  menunggu: number;
  selesai: number;
  ditolak: number;
}

/**
 * Submit a new complaint. Returns the created complaint's ID.
 */
export function createComplaint(data: ComplaintInput): { id: number; ticketNumber: string } {
  const { name, email, subject, message, type, attachments } = data;
  const date = new Date().toISOString();
  const complaintType = type || 'umum';

  const stmt = db.prepare(`
    INSERT INTO pengaduan (name, email, subject, message, type, status, attachments, date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'Baru', ?, ?, datetime('now'), datetime('now'))
  `);

  const info = stmt.run(name, email, subject || '', message, complaintType, attachments || '[]', date);
  const id = Number(info.lastInsertRowid);
  const ticketNumber = `PKD-${String(id).padStart(5, '0')}`;

  // Save ticket_number back to record
  db.prepare(`UPDATE pengaduan SET ticket_number = ? WHERE id = ?`).run(ticketNumber, id);

  // Invalidate cache
  cache.invalidateByPrefix('complaints:');

  return { id, ticketNumber };
}

/**
 * Get all complaints with optional filters and pagination.
 */
export function getComplaints(params: {
  status?: ComplaintStatus | 'pending' | 'processed';
  type?: 'umum' | 'hubungan_industrial';
  search?: string;
  assignedTo?: number;
  page?: number;
  perPage?: number;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(50, Math.max(1, params.perPage || 10));
  const offset = (page - 1) * perPage;

  const conditions: string[] = [];
  const queryParams: (string | number)[] = [];

  // Legacy status compat: map old 'pending'/'processed' to new values
  if (params.status) {
    if (params.status === 'pending') {
      conditions.push("status IN ('Baru', 'Diproses', 'Menunggu Tindak Lanjut')");
    } else if (params.status === 'processed') {
      conditions.push("status IN ('Selesai', 'Ditolak')");
    } else {
      conditions.push('status = ?');
      queryParams.push(params.status);
    }
  }

  if (params.type) {
    conditions.push('type = ?');
    queryParams.push(params.type);
  }

  if (params.search) {
    conditions.push('(name LIKE ? OR email LIKE ? OR subject LIKE ? OR ticket_number LIKE ?)');
    const s = `%${params.search}%`;
    queryParams.push(s, s, s, s);
  }

  if (params.assignedTo) {
    conditions.push('assigned_to = ?');
    queryParams.push(params.assignedTo);
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

  return { items, total, page, perPage };
}

/**
 * Get a single complaint by ID.
 */
export function getComplaintById(id: number): Complaint | null {
  const item = db.prepare('SELECT * FROM pengaduan WHERE id = ?').get(id) as Complaint | undefined;
  return item || null;
}

/**
 * Update a complaint (status, assigned_to, internal_notes).
 */
export function updateComplaint(id: number, data: Partial<{
  status: ComplaintStatus | string;
  assigned_to: number | null;
  internal_notes: string;
  is_spam: number;
}>): boolean {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }
  if (data.assigned_to !== undefined) { fields.push('assigned_to = ?'); params.push(data.assigned_to); }
  if (data.internal_notes !== undefined) { fields.push('internal_notes = ?'); params.push(data.internal_notes); }
  if (data.is_spam !== undefined) { fields.push('is_spam = ?'); params.push(data.is_spam); }

  if (fields.length === 0) return false;

  fields.push("updated_at = datetime('now')");
  params.push(id);

  const info = db.prepare(`UPDATE pengaduan SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  if (info.changes > 0) cache.invalidateByPrefix('complaints:');
  return info.changes > 0;
}

/**
 * Update complaint status (legacy compat).
 */
export function updateComplaintStatus(id: number, status: ComplaintStatus | string): boolean {
  return updateComplaint(id, { status });
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
  return updateComplaint(id, { is_spam: isSpam ? 1 : 0 });
}

/**
 * Get complaint statistics.
 */
export function getComplaintStats(): ComplaintStats {
  const cacheKey = 'complaints:stats';
  const cached = cache.get<ComplaintStats>(cacheKey);
  if (cached) return cached;

  const total = (db.prepare('SELECT COUNT(*) as count FROM pengaduan').get() as any)?.count || 0;
  const baru = (db.prepare("SELECT COUNT(*) as count FROM pengaduan WHERE status = 'Baru'").get() as any)?.count || 0;
  const diproses = (db.prepare("SELECT COUNT(*) as count FROM pengaduan WHERE status = 'Diproses'").get() as any)?.count || 0;
  const menunggu = (db.prepare("SELECT COUNT(*) as count FROM pengaduan WHERE status = 'Menunggu Tindak Lanjut'").get() as any)?.count || 0;
  const selesai = (db.prepare("SELECT COUNT(*) as count FROM pengaduan WHERE status = 'Selesai'").get() as any)?.count || 0;
  const ditolak = (db.prepare("SELECT COUNT(*) as count FROM pengaduan WHERE status = 'Ditolak'").get() as any)?.count || 0;

  // Legacy compat
  const pending = baru + diproses + menunggu;
  const processed = selesai + ditolak;

  const stats = { total, pending, processed, baru, diproses, menunggu, selesai, ditolak };
  cache.set(cacheKey, stats, 60);
  return stats;
}

/**
 * Get all complaints for CSV export (no pagination).
 */
export function getAllComplaintsForExport(params: {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}): Complaint[] {
  const conditions: string[] = [];
  const qp: string[] = [];

  if (params.status) { conditions.push('status = ?'); qp.push(params.status); }
  if (params.type) { conditions.push('type = ?'); qp.push(params.type); }
  if (params.dateFrom) { conditions.push('date >= ?'); qp.push(params.dateFrom); }
  if (params.dateTo) { conditions.push('date <= ?'); qp.push(params.dateTo + 'T23:59:59'); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return db.prepare(`SELECT * FROM pengaduan ${where} ORDER BY date DESC`).all(...qp) as Complaint[];
}
