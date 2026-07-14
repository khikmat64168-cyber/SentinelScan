import type { IReportRepository } from '@domain/repositories/IReportRepository';
import type { IScanRepository } from '@domain/repositories/IScanRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { Report } from '@domain/entities/Report';
import type { ReportFormat } from '@domain/entities/Report';
import { AuditLog, AuditAction } from '@domain/entities/AuditLog';
import { NotFoundError } from '@domain/errors';

export interface GenerateReportCommand {
  scanId: string;
  projectId: string;
  createdBy: string;
  format: ReportFormat;
}

export class GenerateReportUseCase {
  constructor(
    private readonly reportRepo: IReportRepository,
    private readonly scanRepo: IScanRepository,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(cmd: GenerateReportCommand): Promise<Report> {
    const scan = await this.scanRepo.findById(cmd.scanId);
    if (!scan) {
      throw new NotFoundError('Scan', cmd.scanId);
    }

    const report = Report.create({
      scanId:    cmd.scanId,
      projectId: cmd.projectId,
      createdBy: cmd.createdBy,
      format:    cmd.format,
    });

    await this.reportRepo.save(report);
    await this.auditRepo.save(AuditLog.create({
      action:       AuditAction.REPORT_GENERATED,
      actorId:      cmd.createdBy,
      resourceType: 'Report',
      resourceId:   report.id,
      metadata:     { scanId: cmd.scanId, format: cmd.format },
    }));

    return report;
  }
}
