import type { Pool } from 'pg';
import type { ITargetRepository } from '@domain/repositories/ITargetRepository';
import { Target } from '@domain/entities/Target';

interface TargetRow {
  id: string;
  url: string;
  project_id: string;
  is_authorized: boolean;
  authorized_at: Date | null;
  authorized_by: string | null;
  created_at: Date;
}

export class PgTargetRepository implements ITargetRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Target | null> {
    const result = await this.pool.query<TargetRow>(
      'SELECT * FROM targets WHERE id = $1',
      [id],
    );
    const row = result.rows[0];
    return row ? this._toEntity(row) : null;
  }

  async findByProjectId(projectId: string): Promise<Target[]> {
    const result = await this.pool.query<TargetRow>(
      'SELECT * FROM targets WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId],
    );
    return result.rows.map(r => this._toEntity(r));
  }

  async save(target: Target): Promise<void> {
    await this.pool.query(
      `INSERT INTO targets (id, url, project_id, is_authorized, authorized_at, authorized_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         is_authorized = EXCLUDED.is_authorized,
         authorized_at = EXCLUDED.authorized_at,
         authorized_by = EXCLUDED.authorized_by`,
      [target.id, target.url.value, target.projectId,
       target.isAuthorized, target.authorizedAt, target.authorizedBy, target.createdAt],
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM targets WHERE id = $1', [id]);
  }

  private _toEntity(row: TargetRow): Target {
    return Target.rehydrate({
      id:           row.id,
      url:          row.url,
      projectId:    row.project_id,
      isAuthorized: row.is_authorized,
      authorizedAt: row.authorized_at,
      authorizedBy: row.authorized_by,
      createdAt:    row.created_at,
    });
  }
}
