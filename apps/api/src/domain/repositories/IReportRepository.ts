import type { Report } from '../entities/Report';

export interface IReportRepository {
  findById(id: string): Promise<Report | null>;
  findByScanId(scanId: string): Promise<Report[]>;
  save(report: Report): Promise<void>;
  delete(id: string): Promise<void>;
}
