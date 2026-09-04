/**
 * Audit Log Service — records admin actions for traceability.
 */

import sql from '@/lib/db';

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

export async function logAction(params: {
  actorId?: number | null;
  actorName: string;
  actorRole: string;
  action: AuditAction;
  module: string;
  targetId?: string | number | null;
  targetDescription?: string;
  ipAddress?: string;
}): Promise<void> {
  try {
    await sql`
      INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, module, target_id, target_description, ip_address)
      VALUES (
        ${params.actorId ?? null},
        ${params.actorName},
        ${params.actorRole},
        ${params.action},
        ${params.module},
        ${params.targetId?.toString() ?? null},
        ${params.targetDescription ?? null},
        ${params.ipAddress ?? ''}
      )
    `;
  } catch (err) {
    console.error('[AuditLog] Failed to log action:', err);
  }
}

export async function getAuditLogs(params: {
  actorId?: number;
  action?: string;
  module?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}): Promise<{ items: AuditLogEntry[]; total: number; page: number; perPage: number }> {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(100, Math.max(1, params.perPage || 20));
  const offset = (page - 1) * perPage;

  const conditions: string[] = [];
  const qp: (string | number)[] = [];

  if (params.actorId)  { conditions.push(`actor_id = $${qp.length + 1}`);              qp.push(params.actorId); }
  if (params.action)   { conditions.push(`action = $${qp.length + 1}`);                qp.push(params.action); }
  if (params.module)   { conditions.push(`module = $${qp.length + 1}`);                qp.push(params.module); }
  if (params.dateFrom) { conditions.push(`created_at >= $${qp.length + 1}`);           qp.push(params.dateFrom); }
  if (params.dateTo)   { conditions.push(`created_at <= $${qp.length + 1}`);           qp.push(params.dateTo + ' 23:59:59'); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await sql.unsafe(`SELECT COUNT(*) AS c FROM audit_logs ${where}`, qp);
  const total = Number(countResult[0]?.c) || 0;

  const listParams = [...qp, perPage, offset];
  const items = await sql.unsafe(
    `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams
  ) as AuditLogEntry[];

  return { items, total, page, perPage };
}
