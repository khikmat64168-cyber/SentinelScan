import type { IScanRepository } from '@domain/repositories/IScanRepository';
import type { ITargetRepository } from '@domain/repositories/ITargetRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { Scan } from '@domain/entities/Scan';
import { AuditLog, AuditAction } from '@domain/entities/AuditLog';
import { NotFoundError } from '@domain/errors';

export interface StartScanCommand {
  targetId: string;
  projectId: string;
  createdBy: string;
  pluginIds: string[];
}

export class StartScanUseCase {
  constructor(
    private readonly scanRepo: IScanRepository,
    private readonly targetRepo: ITargetRepository,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(cmd: StartScanCommand): Promise<Scan> {
    const target = await this.targetRepo.findById(cmd.targetId);
    if (!target) {
      throw new NotFoundError('Target', cmd.targetId);
    }

    target.assertAuthorized();

    const scan = Scan.create({
      targetId:  cmd.targetId,
      projectId: cmd.projectId,
      createdBy: cmd.createdBy,
      pluginIds: cmd.pluginIds,
    });

    await this.scanRepo.save(scan);
    await this.auditRepo.save(AuditLog.create({
      action:       AuditAction.SCAN_STARTED,
      actorId:      cmd.createdBy,
      resourceType: 'Scan',
      resourceId:   scan.id,
      metadata:     { targetId: cmd.targetId, pluginIds: cmd.pluginIds },
    }));

    return scan;
  }
}
