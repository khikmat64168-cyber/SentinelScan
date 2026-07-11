import type { IScanRepository } from '@domain/repositories/IScanRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { AuditLog, AuditAction } from '@domain/entities/AuditLog';
import { NotFoundError } from '@domain/errors';

export class CancelScanUseCase {
  constructor(
    private readonly scanRepo: IScanRepository,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(scanId: string, requestedBy: string): Promise<void> {
    const scan = await this.scanRepo.findById(scanId);
    if (!scan) {
      throw new NotFoundError('Scan', scanId);
    }

    scan.cancel();
    await this.scanRepo.save(scan);
    await this.auditRepo.save(AuditLog.create({
      action:       AuditAction.SCAN_CANCELLED,
      actorId:      requestedBy,
      resourceType: 'Scan',
      resourceId:   scanId,
    }));
  }
}
