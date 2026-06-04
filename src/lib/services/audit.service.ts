/**
 * Audit Log Service — records admin actions for traceability.
 */

import db from '@/lib/db';

export interface AuditLogEntry {
  id: number;
  actor_id: number | null;
  actor_name: string;
  actor_role: string;
  action: string;
  module: string;
  target_id: string | null;
  target_description: string | null;
  ip_address: string;
  created_at: string;
}

export type AuditAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'export' | 'status_change' | 'upload' | 'view';

export function logAction(params: {
  actorId?: number | null;
  actorName: string;
  actorRole: string;
  action: AuditAction;
  module: string;
  targetId?: string | number | null;
  targetDescription?: string;
  ipAddress?: string;
}): void {
  try {
    db.prepare(`
      INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, module, target_id, target_description, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      params.actorId ?? null,
      params.actorName,
      params.actorRole,
      params.action,
      params.module,
      params.targetId?.toString() ?? null,
      params.targetDescription ?? null,
      params.ipAddress ?? ''
    );
  } catch (err) {
    console.error('[AuditLog] Failed to log action:', err);
  }
}

export function getAuditLogs(params: {
  actorId?: number;
  action?: string;
  module?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}): { items: AuditLogEntry[]; total: number; page: number; perPage: number } {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(100, Math.max(1, params.perPage || 20));
  const offset = (page - 1) * perPage;

  const conditions: string[] = [];
  const qp: (string | number)[] = [];

  if (params.actorId) { conditions.push('actor_id = ?'); qp.push(params.actorId); }
  if (params.action) { conditions.push('action = ?'); qp.push(params.action); }
  if (params.module) { conditions.push('module = ?'); qp.push(params.module); }
  if (params.dateFrom) { conditions.push('created_at >= ?'); qp.push(params.dateFrom); }
  if (params.dateTo) { conditions.push('created_at <= ?'); qp.push(params.dateTo + ' 23:59:59'); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = (db.prepare(`SELECT COUNT(*) as c FROM audit_logs ${where}`).get(...qp) as any)?.c || 0;
  const items = db.prepare(
    `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...qp, perPage, offset) as AuditLogEntry[];

  return { items, total, page, perPage };
}
