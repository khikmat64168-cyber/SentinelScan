import type { Pool } from 'pg';
import type { IAuditLogRepository, AuditLogFilter } from '@domain/repositories/IAuditLogRepository';
import { AuditLog } from '@domain/entities/AuditLog';
import type { AuditAction } from '@domain/entities/AuditLog';

interface AuditLogRow {
  id: string;
  action: string;
  actor_id: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: Date;
}

export class PgAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<AuditLog | null> {
    const result = await this.pool.query<AuditLogRow>(
      'SELECT * FROM audit_logs WHERE id = $1',
      [id],
    );
    const row = result.rows[0];
    return row ? this._toEntity(row) : null;
  }

  async findByFilter(filter: AuditLogFilter): Promise<AuditLog[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filter.actorId) {
      conditions.push(`actor_id = $${String(idx++)}`);
      params.push(filter.actorId);
    }
    if (filter.resourceType) {
      conditions.push(`resource_type = $${String(idx++)}`);
      params.push(filter.resourceType);
    }
    if (filter.resourceId) {
      conditions.push(`resource_id = $${String(idx++)}`);
      params.push(filter.resourceId);
    }
    if (filter.action) {
      conditions.push(`action = $${String(idx++)}`);
      params.push(filter.action);
    }
    if (filter.from) {
      conditions.push(`created_at >= $${String(idx++)}`);
      params.push(filter.from);
    }
    if (filter.to) {
      conditions.push(`created_at <= $${String(idx++)}`);
      params.push(filter.to);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await this.pool.query<AuditLogRow>(
      `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT 1000`,
      params,
    );
    return result.rows.map(r => this._toEntity(r));
  }

  async save(log: AuditLog): Promise<void> {
    await this.pool.query(
      `INSERT INTO audit_logs
         (id, action, actor_id, resource_type, resource_id, metadata, ip_address, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO NOTHING`,
      [log.id, log.action, log.actorId, log.resourceType,
       log.resourceId, JSON.stringify(log.metadata), log.ipAddress, log.createdAt],
    );
  }

  private _toEntity(row: AuditLogRow): AuditLog {
    return AuditLog.rehydrate({
      id:           row.id,
      action:       row.action as AuditAction,
      actorId:      row.actor_id,
      resourceType: row.resource_type,
      resourceId:   row.resource_id,
      metadata:     row.metadata,
      ipAddress:    row.ip_address,
      createdAt:    row.created_at,
    });
  }
}
