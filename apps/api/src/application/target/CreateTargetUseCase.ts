import type { ITargetRepository } from '@domain/repositories/ITargetRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { Target } from '@domain/entities/Target';
import { AuditLog, AuditAction } from '@domain/entities/AuditLog';

export interface CreateTargetCommand {
  url: string;
  projectId: string;
  createdBy: string;
}

export class CreateTargetUseCase {
  constructor(
    private readonly targetRepo: ITargetRepository,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(cmd: CreateTargetCommand): Promise<{ targetId: string }> {
    const target = Target.create({ url: cmd.url, projectId: cmd.projectId });

    await this.targetRepo.save(target);
    await this.auditRepo.save(AuditLog.create({
      action:       AuditAction.TARGET_CREATED,
      actorId:      cmd.createdBy,
      resourceType: 'Target',
      resourceId:   target.id,
      metadata:     { url: cmd.url },
    }));

    return { targetId: target.id };
  }
}
