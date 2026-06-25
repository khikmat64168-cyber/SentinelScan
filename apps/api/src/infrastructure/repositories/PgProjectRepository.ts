import type { Pool } from 'pg';
import type { IProjectRepository } from '@domain/repositories/IProjectRepository';
import { Project } from '@domain/entities/Project';

interface ProjectRow {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export class PgProjectRepository implements IProjectRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Project | null> {
    const result = await this.pool.query<ProjectRow>(
      'SELECT * FROM projects WHERE id = $1',
      [id],
    );
    const row = result.rows[0];
    return row ? this._toEntity(row) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    const result = await this.pool.query<ProjectRow>(
      'SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC',
      [ownerId],
    );
    return result.rows.map(r => this._toEntity(r));
  }

  async save(project: Project): Promise<void> {
    await this.pool.query(
      `INSERT INTO projects (id, name, description, owner_id, is_archived, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         name        = EXCLUDED.name,
         description = EXCLUDED.description,
         is_archived = EXCLUDED.is_archived,
         updated_at  = EXCLUDED.updated_at`,
      [project.id, project.name, project.description, project.ownerId,
       project.isArchived, project.createdAt, project.updatedAt],
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM projects WHERE id = $1', [id]);
  }

  private _toEntity(row: ProjectRow): Project {
    return Project.rehydrate({
      id:          row.id,
      name:        row.name,
      description: row.description,
      ownerId:     row.owner_id,
      isArchived:  row.is_archived,
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
    });
  }
}
