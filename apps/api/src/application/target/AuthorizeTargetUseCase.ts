import type { ITargetRepository } from '@domain/repositories/ITargetRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { AuditLog, AuditAction } from '@domain/entities/AuditLog';
import { NotFoundError } from '@domain/errors';

export class AuthorizeTargetUseCase {
  constructor(
    private readonly targetRepo: ITargetRepository,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(targetId: string, authorizedBy: string): Promise<void> {
    const target = await this.targetRepo.findById(targetId);
    if (!target) {
      throw new NotFoundError('Target', targetId);
    }

    target.authorize(authorizedBy);
    await this.targetRepo.save(target);
    await this.auditRepo.save(AuditLog.create({
      action:       AuditAction.TARGET_AUTHORIZED,
      actorId:      authorizedBy,
      resourceType: 'Target',
      resourceId:   targetId,
      metadata:     { url: target.url.value },
    }));
  }
}
