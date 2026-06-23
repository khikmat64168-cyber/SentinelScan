import type { Scan, ScanStatus } from '../entities/Scan';

export interface IScanRepository {
  findById(id: string): Promise<Scan | null>;
  findByTargetId(targetId: string): Promise<Scan[]>;
  findByProjectId(projectId: string, status?: ScanStatus): Promise<Scan[]>;
  save(scan: Scan): Promise<void>;
  delete(id: string): Promise<void>;
}
