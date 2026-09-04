/**
 * Complaint (Pengaduan) Service — Business logic layer.
 * Upgraded with full status lifecycle, ticket numbers, assignment, internal notes.
 */

import sql from '@/lib/db';
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
  is_spam: boolean;
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
 * Submit a new complaint. Returns the created complaint's ID and ticket number.
 */
export async function createComplaint(data: ComplaintInput): Promise<{ id: number; ticketNumber: string }> {
  const { name, email, subject, message, type, attachments } = data;
  const date = new Date().toISOString();
  const complaintType = type || 'umum';

  const result = await sql`
    INSERT INTO pengaduan (name, email, subject, message, type, status, attachments, date, created_at, updated_at)
    VALUES (
      ${name}, ${email}, ${subject || ''}, ${message}, ${complaintType},
      'Baru', ${attachments || '[]'}, ${date}, NOW(), NOW()
    )
    RETURNING id
  `;
  const id = Number(result[0].id);
  const ticketNumber = `PKD-${String(id).padStart(5, '0')}`;

  await sql`UPDATE pengaduan SET ticket_number = ${ticketNumber} WHERE id = ${id}`;

  cache.invalidateByPrefix('complaints:');
  return { id, ticketNumber };
}

/**
 * Get all complaints with optional filters and pagination.
 */
export async function getComplaints(params: {
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
  const qp: (string | number)[] = [];

  if (params.status) {
    if (params.status === 'pending') {
      conditions.push(`status IN ('Baru', 'Diproses', 'Menunggu Tindak Lanjut')`);
    } else if (params.status === 'processed') {
      conditions.push(`status IN ('Selesai', 'Ditolak')`);
    } else {
      conditions.push(`status = $${qp.length + 1}`);
      qp.push(params.status);
    }
  }

  if (params.type) {
    conditions.push(`type = $${qp.length + 1}`);
    qp.push(params.type);
  }

  if (params.search) {
    conditions.push(`(name ILIKE $${qp.length + 1} OR email ILIKE $${qp.length + 2} OR subject ILIKE $${qp.length + 3} OR ticket_number ILIKE $${qp.length + 4})`);
    const s = `%${params.search}%`;
    qp.push(s, s, s, s);
  }

  if (params.assignedTo) {
    conditions.push(`assigned_to = $${qp.length + 1}`);
    qp.push(params.assignedTo);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await sql.unsafe(`SELECT COUNT(*) AS total FROM pengaduan ${where}`, qp);
  const total = Number(countResult[0]?.total) || 0;

  const listParams = [...qp, perPage, offset];
  const items = await sql.unsafe(
    `SELECT * FROM pengaduan ${where} ORDER BY date DESC LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams
  ) as Complaint[];

  return { items, total, page, perPage };
}

/**
 * Get a single complaint by ID.
 */
export async function getComplaintById(id: number): Promise<Complaint | null> {
  const rows = await sql`SELECT * FROM pengaduan WHERE id = ${id}`;
  return (rows[0] as Complaint) || null;
}

/**
 * Update a complaint (status, assigned_to, internal_notes).
 */
export async function updateComplaint(id: number, data: Partial<{
  status: ComplaintStatus | string;
  assigned_to: number | null;
  internal_notes: string;
  is_spam: boolean;
}>): Promise<boolean> {
  const fields: string[] = [];
  const params: (string | number | boolean | null)[] = [];

  if (data.status !== undefined)         { fields.push(`status = $${params.length + 1}`);         params.push(data.status); }
  if (data.assigned_to !== undefined)    { fields.push(`assigned_to = $${params.length + 1}`);    params.push(data.assigned_to); }
  if (data.internal_notes !== undefined) { fields.push(`internal_notes = $${params.length + 1}`); params.push(data.internal_notes); }
  if (data.is_spam !== undefined)        { fields.push(`is_spam = $${params.length + 1}`);        params.push(data.is_spam); }

  if (fields.length === 0) return false;

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await sql.unsafe(
    `UPDATE pengaduan SET ${fields.join(', ')} WHERE id = $${params.length}`,
    params
  );
  if (result.count > 0) cache.invalidateByPrefix('complaints:');
  return result.count > 0;
}

/**
 * Update complaint status (legacy compat).
 */
export async function updateComplaintStatus(id: number, status: ComplaintStatus | string): Promise<boolean> {
  return updateComplaint(id, { status });
}

/**
 * Delete a complaint.
 */
export async function deleteComplaint(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM pengaduan WHERE id = ${id}`;
  cache.invalidateByPrefix('complaints:');
  return result.count > 0;
}

/**
 * Mark complaint as spam or not.
 */
export async function updateSpamStatus(id: number, isSpam: boolean): Promise<boolean> {
  return updateComplaint(id, { is_spam: isSpam });
}

/**
 * Get complaint statistics.
 */
export async function getComplaintStats(): Promise<ComplaintStats> {
  const cacheKey = 'complaints:stats';
  const cached = cache.get<ComplaintStats>(cacheKey);
  if (cached) return cached;

  const rows = await sql`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'Baru') AS baru,
      COUNT(*) FILTER (WHERE status = 'Diproses') AS diproses,
      COUNT(*) FILTER (WHERE status = 'Menunggu Tindak Lanjut') AS menunggu,
      COUNT(*) FILTER (WHERE status = 'Selesai') AS selesai,
      COUNT(*) FILTER (WHERE status = 'Ditolak') AS ditolak
    FROM pengaduan
  `;
  const r = rows[0] as any;

  const baru = Number(r.baru);
  const diproses = Number(r.diproses);
  const menunggu = Number(r.menunggu);
  const selesai = Number(r.selesai);
  const ditolak = Number(r.ditolak);

  const stats: ComplaintStats = {
    total: Number(r.total),
    pending: baru + diproses + menunggu,
    processed: selesai + ditolak,
    baru, diproses, menunggu, selesai, ditolak,
  };

  cache.set(cacheKey, stats, 60);
  return stats;
}

/**
 * Get all complaints for CSV export (no pagination).
 */
export async function getAllComplaintsForExport(params: {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Complaint[]> {
  const conditions: string[] = [];
  const qp: string[] = [];

  if (params.status)   { conditions.push(`status = $${qp.length + 1}`);   qp.push(params.status); }
  if (params.type)     { conditions.push(`type = $${qp.length + 1}`);     qp.push(params.type); }
  if (params.dateFrom) { conditions.push(`date >= $${qp.length + 1}`);    qp.push(params.dateFrom); }
  if (params.dateTo)   { conditions.push(`date <= $${qp.length + 1}`);    qp.push(params.dateTo + 'T23:59:59'); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return sql.unsafe(`SELECT * FROM pengaduan ${where} ORDER BY date DESC`, qp) as Promise<Complaint[]>;
}
