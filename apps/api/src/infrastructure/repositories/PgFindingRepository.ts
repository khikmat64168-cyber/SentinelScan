import type { Pool } from 'pg';
import type { IFindingRepository, FindingFilter } from '@domain/repositories/IFindingRepository';
import { Finding } from '@domain/entities/Finding';
import type { FindingType } from '@domain/entities/Finding';
import type { SeverityLevel } from '@domain/value-objects/Severity';

interface FindingRow {
  id: string;
  scan_id: string;
  target_id: string;
  plugin_id: string;
  title: string;
  description: string;
  type: string;
  severity_level: string;
  cvss_score: string | null;
  evidence: string | null;
  recommendation: string | null;
  affected_url: string | null;
  created_at: Date;
}

export class PgFindingRepository implements IFindingRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Finding | null> {
    const result = await this.pool.query<FindingRow>(
      'SELECT * FROM findings WHERE id = $1',
      [id],
    );
    const row = result.rows[0];
    return row ? this._toEntity(row) : null;
  }

  async findByScanId(scanId: string): Promise<Finding[]> {
    const result = await this.pool.query<FindingRow>(
      'SELECT * FROM findings WHERE scan_id = $1 ORDER BY severity_level, created_at',
      [scanId],
    );
    return result.rows.map(r => this._toEntity(r));
  }

  async findByFilter(filter: FindingFilter): Promise<Finding[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filter.scanId) {
      conditions.push(`scan_id = $${String(idx++)}`);
      params.push(filter.scanId);
    }
    if (filter.targetId) {
      conditions.push(`target_id = $${String(idx++)}`);
      params.push(filter.targetId);
    }
    if (filter.severityLevel) {
      conditions.push(`severity_level = $${String(idx++)}`);
      params.push(filter.severityLevel);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await this.pool.query<FindingRow>(
      `SELECT * FROM findings ${where} ORDER BY created_at DESC`,
      params,
    );
    return result.rows.map(r => this._toEntity(r));
  }

  async save(finding: Finding): Promise<void> {
    await this.pool.query(
      `INSERT INTO findings
         (id, scan_id, target_id, plugin_id, title, description, type,
          severity_level, cvss_score, evidence, recommendation, affected_url, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO NOTHING`,
      [finding.id, finding.scanId, finding.targetId, finding.pluginId,
       finding.title, finding.description, finding.type,
       finding.severity.value, finding.cvssScore?.value ?? null,
       finding.evidence, finding.recommendation, finding.affectedUrl, finding.createdAt],
    );
  }

  async saveBatch(findings: Finding[]): Promise<void> {
    if (findings.length === 0) { return; }
    for (const f of findings) {
      await this.save(f);
    }
  }

  async deleteBysScanId(scanId: string): Promise<void> {
    await this.pool.query('DELETE FROM findings WHERE scan_id = $1', [scanId]);
  }

  private _toEntity(row: FindingRow): Finding {
    return Finding.rehydrate({
      id:             row.id,
      scanId:         row.scan_id,
      targetId:       row.target_id,
      pluginId:       row.plugin_id,
      title:          row.title,
      description:    row.description,
      type:           row.type as FindingType,
      severityLevel:  row.severity_level as SeverityLevel,
      cvssScore:      row.cvss_score !== null ? parseFloat(row.cvss_score) : null,
      evidence:       row.evidence,
      recommendation: row.recommendation,
      affectedUrl:    row.affected_url,
      createdAt:      row.created_at,
    });
  }
}
