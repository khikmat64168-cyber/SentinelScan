import type { Pool } from 'pg';
import type { IReportRepository } from '@domain/repositories/IReportRepository';
import { Report } from '@domain/entities/Report';
import type { ReportFormat, ReportStatus } from '@domain/entities/Report';

interface ReportRow {
  id: string;
  scan_id: string;
  project_id: string;
  created_by: string;
  format: string;
  status: string;
  storage_path: string | null;
  created_at: Date;
  generated_at: Date | null;
}

export class PgReportRepository implements IReportRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Report | null> {
    const result = await this.pool.query<ReportRow>(
      'SELECT * FROM reports WHERE id = $1',
      [id],
    );
    const row = result.rows[0];
    return row ? this._toEntity(row) : null;
  }

  async findByScanId(scanId: string): Promise<Report[]> {
    const result = await this.pool.query<ReportRow>(
      'SELECT * FROM reports WHERE scan_id = $1 ORDER BY created_at DESC',
      [scanId],
    );
    return result.rows.map(r => this._toEntity(r));
  }

  async save(report: Report): Promise<void> {
    await this.pool.query(
      `INSERT INTO reports
         (id, scan_id, project_id, created_by, format, status,
          storage_path, created_at, generated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         status       = EXCLUDED.status,
         storage_path = EXCLUDED.storage_path,
         generated_at = EXCLUDED.generated_at`,
      [report.id, report.scanId, report.projectId, report.createdBy,
       report.format, report.status, report.storagePath,
       report.createdAt, report.generatedAt],
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM reports WHERE id = $1', [id]);
  }

  private _toEntity(row: ReportRow): Report {
    return Report.rehydrate({
      id:          row.id,
      scanId:      row.scan_id,
      projectId:   row.project_id,
      createdBy:   row.created_by,
      format:      row.format as ReportFormat,
      status:      row.status as ReportStatus,
      storagePath: row.storage_path,
      createdAt:   row.created_at,
      generatedAt: row.generated_at,
    });
  }
}
