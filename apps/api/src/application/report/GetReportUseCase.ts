import type { IReportRepository } from '@domain/repositories/IReportRepository';
import type { Report } from '@domain/entities/Report';
import { NotFoundError } from '@domain/errors';

export class GetReportUseCase {
  constructor(private readonly reportRepo: IReportRepository) {}

  async execute(reportId: string): Promise<Report> {
    const report = await this.reportRepo.findById(reportId);
    if (!report) {
      throw new NotFoundError('Report', reportId);
    }
    return report;
  }
}
