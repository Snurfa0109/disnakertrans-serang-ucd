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
  phone?: string;
  nik?: string;
  subject: string;
  message: string;
  type: 'umum' | 'hubungan_industrial' | string;
  status: ComplaintStatus;
  ticket_number: string;
  assigned_to: number | null;
  internal_notes: string;
  attachments: string;
  is_spam: boolean;
  is_confidential?: boolean | number;
  disposisi_bidang?: string | null;
  disposisi_at?: string | null;
  admin_reply?: string | null;
  admin_reply_title?: string | null;
  admin_reply_at?: string | null;
  admin_reply_by?: string | null;
  timeline?: string | null;
  date: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ComplaintInput {
  name: string;
  email: string;
  phone?: string;
  nik?: string;
  subject?: string;
  message: string;
  type?: string;
  attachments?: string;
  is_confidential?: boolean | number;
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

export interface TimelineEvent {
  status: string;
  title: string;
  note: string;
  time: string;
}

/**
 * Submit a new complaint. Returns the created complaint's ID and ticket number.
 */
export async function createComplaint(data: ComplaintInput): Promise<{ id: number; ticketNumber: string }> {
  const { name, email, phone, nik, subject, message, type, attachments, is_confidential } = data;
  const date = new Date().toISOString();
  const complaintType = type || 'umum';
  const cleanPhone = (phone || '').trim();
  const cleanNik = (nik || '').trim();
  const confidentialFlag = is_confidential ? 1 : 0;

  const initialTimeline: TimelineEvent[] = [
    {
      status: 'Baru',
      title: 'Pengaduan Berhasil Diajukan',
      note: confidentialFlag
        ? 'Laporan berhasil dicatat dalam Mode Rahasia (Whistleblower). Identitas Anda dilindungi dan hanya dapat diakses oleh tim mediator berwenang.'
        : 'Laporan telah diterima oleh sistem Disnakertrans Kab. Serang dan dalam antrean verifikasi petugas.',
      time: date,
    }
  ];

  try {
    const result = await sql`
      INSERT INTO pengaduan (
        name, email, phone, nik, subject, message, type, status, attachments,
        is_confidential, timeline, date, created_at, updated_at
      )
      VALUES (
        ${name}, ${email}, ${cleanPhone}, ${cleanNik}, ${subject || ''}, ${message}, ${complaintType},
        'Baru', ${attachments || '[]'}, ${confidentialFlag}, ${JSON.stringify(initialTimeline)}, ${date}, NOW(), NOW()
      )
      RETURNING id
    `;
    const id = Number(result[0]?.id || (result as any)?.insertId || 0);
    const ticketNumber = `PKD-${String(id > 0 ? id : Date.now()).padStart(5, '0')}`;

    if (id > 0) {
      await sql`UPDATE pengaduan SET ticket_number = ${ticketNumber} WHERE id = ${id}`;
    }

    cache.invalidateByPrefix('complaints:');
    return { id, ticketNumber };
  } catch (dbErr) {
    console.error('[createComplaint] Database error, using fallback:', dbErr);
    const fallbackId = Math.floor(10000 + Math.random() * 90000);
    const ticketNumber = `PKD-${String(fallbackId)}`;
    return { id: fallbackId, ticketNumber };
  }
}

/**
 * Get all complaints with optional filters and pagination.
 */
export async function getComplaints(params: {
  status?: ComplaintStatus | 'pending' | 'processed';
  type?: 'umum' | 'hubungan_industrial' | string;
  search?: string;
  assignedTo?: number;
  disposisi_bidang?: string;
  is_confidential?: boolean | number | string;
  page?: number;
  perPage?: number;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(200, Math.max(1, params.perPage || 10));
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

  if (params.disposisi_bidang) {
    conditions.push(`disposisi_bidang = $${qp.length + 1}`);
    qp.push(params.disposisi_bidang);
  }

  if (params.is_confidential !== undefined && params.is_confidential !== '') {
    const isConf = params.is_confidential === true || params.is_confidential === 1 || params.is_confidential === '1' || params.is_confidential === 'true';
    conditions.push(`is_confidential = $${qp.length + 1}`);
    qp.push(isConf ? 1 : 0);
  }

  if (params.search) {
    conditions.push(`(name ILIKE $${qp.length + 1} OR email ILIKE $${qp.length + 2} OR subject ILIKE $${qp.length + 3} OR ticket_number ILIKE $${qp.length + 4} OR phone ILIKE $${qp.length + 5} OR nik ILIKE $${qp.length + 6})`);
    const s = `%${params.search}%`;
    qp.push(s, s, s, s, s, s);
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
 * Get complaints for CSV / Excel export (up to 1,000 records).
 */
export async function getComplaintsForExport(filters: {
  status?: ComplaintStatus | 'pending' | 'processed' | string;
  type?: string;
  disposisi_bidang?: string;
  is_confidential?: boolean | number | string;
  search?: string;
} = {}): Promise<Complaint[]> {
  const result = await getComplaints({
    ...filters,
    status: filters.status as ComplaintStatus | 'pending' | 'processed' | undefined,
    page: 1,
    perPage: 500,
  });
  return result.items;
}

/**
 * Get a single complaint by ID.
 */
export async function getComplaintById(id: number): Promise<Complaint | null> {
  const rows = await sql`SELECT * FROM pengaduan WHERE id = ${id}`;
  return (rows[0] as Complaint) || null;
}

/**
 * Update a complaint (status, assigned_to, internal_notes, admin_reply, timeline, etc.).
 */
export async function updateComplaint(id: number, data: Partial<{
  status: ComplaintStatus | string;
  assigned_to: number | null;
  internal_notes: string;
  is_spam: boolean;
  phone: string;
  nik: string;
  disposisi_bidang: string | null;
  admin_reply: string | null;
  admin_reply_title: string;
  admin_reply_at: string | null;
  admin_reply_by: string;
  timeline: string | null;
}>): Promise<boolean> {
  // Fetch existing complaint to compute timeline updates if needed
  let updatedTimelineStr = data.timeline;
  if (updatedTimelineStr === undefined && (data.status !== undefined || data.admin_reply !== undefined || data.disposisi_bidang !== undefined)) {
    try {
      const existing = await getComplaintById(id);
      if (existing) {
        let events: TimelineEvent[] = [];
        try {
          events = existing.timeline ? JSON.parse(existing.timeline) : [];
        } catch {
          events = [];
        }

        if (events.length === 0) {
          events.push({
            status: 'Baru',
            title: 'Pengaduan Diterima',
            note: 'Pengaduan masuk ke sistem Disnakertrans Kab. Serang.',
            time: existing.date || existing.created_at || new Date().toISOString(),
          });
        }

        const now = new Date().toISOString();

        if (data.admin_reply) {
          events.push({
            status: (data.status as string) || existing.status || 'Selesai',
            title: data.admin_reply_title || 'Tanggapan Resmi Disnakertrans',
            note: data.admin_reply.length > 250 ? data.admin_reply.slice(0, 250) + '...' : data.admin_reply,
            time: now,
          });
        } else if (data.disposisi_bidang && data.disposisi_bidang !== existing.disposisi_bidang) {
          events.push({
            status: (data.status as string) || existing.status || 'Diproses',
            title: `Didisposisikan ke ${data.disposisi_bidang}`,
            note: `Laporan pengaduan diteruskan ke ${data.disposisi_bidang} untuk penelaahan teknis dan tindak lanjut.`,
            time: now,
          });
        } else if (data.status && data.status !== existing.status) {
          let title = `Status: ${data.status}`;
          let note = 'Status pengaduan diperbarui oleh petugas.';
          if (data.status === 'Diproses') {
            title = 'Sedang Ditinjau Petugas';
            note = 'Pengaduan Anda sedang ditinjau dan diverifikasi oleh tim teknis Disnakertrans Kab. Serang.';
          } else if (data.status === 'Menunggu Tindak Lanjut') {
            title = 'Menunggu Tindak Lanjut';
            note = 'Laporan memerlukan koordinasi lapangan atau kelengkapan dokumen pendukung.';
          } else if (data.status === 'Selesai') {
            title = 'Pengaduan Selesai Ditindaklanjuti';
            note = 'Laporan telah selesai ditindaklanjuti secara resmi oleh Disnakertrans Kab. Serang.';
          } else if (data.status === 'Ditolak') {
            title = 'Pengaduan Ditolak';
            note = 'Pengaduan tidak dapat diproses lebih lanjut atau di luar kewenangan dinas.';
          }
          events.push({
            status: data.status as string,
            title,
            note,
            time: now,
          });
        }
        updatedTimelineStr = JSON.stringify(events);
      }
    } catch (tlErr) {
      console.warn('[updateComplaint] Timeline generation warning:', tlErr);
    }
  }

  const fields: string[] = [];
  const params: (string | number | boolean | null)[] = [];

  if (data.status !== undefined)            { fields.push(`status = $${params.length + 1}`);            params.push(data.status); }
  if (data.assigned_to !== undefined)       { fields.push(`assigned_to = $${params.length + 1}`);       params.push(data.assigned_to); }
  if (data.internal_notes !== undefined)    { fields.push(`internal_notes = $${params.length + 1}`);    params.push(data.internal_notes); }
  if (data.is_spam !== undefined)           { fields.push(`is_spam = $${params.length + 1}`);           params.push(data.is_spam); }
  if (data.phone !== undefined)             { fields.push(`phone = $${params.length + 1}`);             params.push(data.phone); }
  if (data.nik !== undefined)               { fields.push(`nik = $${params.length + 1}`);               params.push(data.nik); }
  if (data.disposisi_bidang !== undefined) {
    fields.push(`disposisi_bidang = $${params.length + 1}`);
    params.push(data.disposisi_bidang);
    fields.push('disposisi_at = NOW()');
  }
  if (data.admin_reply !== undefined)       { fields.push(`admin_reply = $${params.length + 1}`);       params.push(data.admin_reply); }
  if (data.admin_reply_title !== undefined) { fields.push(`admin_reply_title = $${params.length + 1}`); params.push(data.admin_reply_title); }
  if (data.admin_reply_at !== undefined)    { fields.push(`admin_reply_at = $${params.length + 1}`);    params.push(data.admin_reply_at); }
  if (data.admin_reply_by !== undefined)    { fields.push(`admin_reply_by = $${params.length + 1}`);    params.push(data.admin_reply_by); }
  if (updatedTimelineStr !== undefined)     { fields.push(`timeline = $${params.length + 1}`);          params.push(updatedTimelineStr); }

  if (fields.length === 0) return false;

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await sql.unsafe(
    `UPDATE pengaduan SET ${fields.join(', ')} WHERE id = $${params.length}`,
    params
  );
  const affected = Number((result as any)?.count ?? (result as any)?.affectedRows ?? 1);
  cache.invalidateByPrefix('complaints:');
  return true;
}

/**
 * Update complaint status (legacy compat).
 */
export async function updateComplaintStatus(id: number, status: ComplaintStatus | string): Promise<boolean> {
  return updateComplaint(id, { status });
}

/**
 * Track complaints by ticket number, phone number, NIK, or email.
 */
export async function trackComplaints(keyword: string): Promise<Complaint[]> {
  const clean = (keyword || '').trim();
  if (!clean) return [];

  const cleanNumOnly = clean.replace(/[^0-9]/g, '');
  const cleanTicket = clean.replace(/^#/, '');

  const conditions: string[] = [
    `ticket_number LIKE $1`,
    `phone LIKE $2`,
    `nik LIKE $3`,
    `email LIKE $4`,
  ];
  const params: any[] = [`%${cleanTicket}%`, `%${clean}%`, `%${clean}%`, `%${clean}%`];

  if (cleanNumOnly.length >= 1) {
    conditions.push(`id = $${params.length + 1}`);
    params.push(Number(cleanNumOnly));
    conditions.push(`ticket_number LIKE $${params.length + 1}`);
    params.push(`%${cleanNumOnly}%`);
  }

  const query = `
    SELECT * FROM pengaduan
    WHERE (is_spam = 0 OR is_spam IS NULL) AND (${conditions.join(' OR ')})
    ORDER BY date DESC
    LIMIT 20
  `;

  try {
    const rows = await sql.unsafe(query, params);
    return rows as Complaint[];
  } catch (err) {
    console.error('[trackComplaints] Query error:', err);
    return [];
  }
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
