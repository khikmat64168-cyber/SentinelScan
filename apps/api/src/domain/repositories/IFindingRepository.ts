import type { Finding } from '../entities/Finding';
import type { SeverityLevel } from '../value-objects/Severity';

export interface FindingFilter {
  scanId?: string;
  targetId?: string;
  severityLevel?: SeverityLevel;
}

export interface IFindingRepository {
  findById(id: string): Promise<Finding | null>;
  findByScanId(scanId: string): Promise<Finding[]>;
  findByFilter(filter: FindingFilter): Promise<Finding[]>;
  save(finding: Finding): Promise<void>;
  saveBatch(findings: Finding[]): Promise<void>;
  deleteBysScanId(scanId: string): Promise<void>;
}
