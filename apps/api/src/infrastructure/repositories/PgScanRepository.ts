import type { Pool } from 'pg';
import type { IScanRepository } from '@domain/repositories/IScanRepository';
import { Scan } from '@domain/entities/Scan';
import type { ScanStatus } from '@domain/entities/Scan';

interface ScanRow {
  id: string;
  target_id: string;
  project_id: string;
  created_by: string;
  plugin_ids: string[];
  status: string;
  started_at: Date | null;
  completed_at: Date | null;
  error_message: string | null;
  created_at: Date;
}

export class PgScanRepository implements IScanRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Scan | null> {
    const result = await this.pool.query<ScanRow>(
      'SELECT * FROM scans WHERE id = $1',
      [id],
    );
    const row = result.rows[0];
    return row ? this._toEntity(row) : null;
  }

  async findByTargetId(targetId: string): Promise<Scan[]> {
    const result = await this.pool.query<ScanRow>(
      'SELECT * FROM scans WHERE target_id = $1 ORDER BY created_at DESC',
      [targetId],
    );
    return result.rows.map(r => this._toEntity(r));
  }

  async findByProjectId(projectId: string, status?: ScanStatus): Promise<Scan[]> {
    if (status) {
      const result = await this.pool.query<ScanRow>(
        'SELECT * FROM scans WHERE project_id = $1 AND status = $2 ORDER BY created_at DESC',
        [projectId, status],
      );
      return result.rows.map(r => this._toEntity(r));
    }
    const result = await this.pool.query<ScanRow>(
      'SELECT * FROM scans WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId],
    );
    return result.rows.map(r => this._toEntity(r));
  }

  async save(scan: Scan): Promise<void> {
    await this.pool.query(
      `INSERT INTO scans
         (id, target_id, project_id, created_by, plugin_ids, status,
          started_at, completed_at, error_message, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         status        = EXCLUDED.status,
         started_at    = EXCLUDED.started_at,
         completed_at  = EXCLUDED.completed_at,
         error_message = EXCLUDED.error_message`,
      [scan.id, scan.targetId, scan.projectId, scan.createdBy,
       scan.pluginIds, scan.status, scan.startedAt,
       scan.completedAt, scan.errorMessage, scan.createdAt],
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM scans WHERE id = $1', [id]);
  }

  private _toEntity(row: ScanRow): Scan {
    return Scan.rehydrate({
      id:           row.id,
      targetId:     row.target_id,
      projectId:    row.project_id,
      createdBy:    row.created_by,
      pluginIds:    row.plugin_ids,
      status:       row.status as ScanStatus,
      startedAt:    row.started_at,
      completedAt:  row.completed_at,
      errorMessage: row.error_message,
      createdAt:    row.created_at,
    });
  }
}
