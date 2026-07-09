import type { IProjectRepository } from '@domain/repositories/IProjectRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { AuditLog, AuditAction } from '@domain/entities/AuditLog';
import { NotFoundError, AuthorizationError } from '@domain/errors';

export class ArchiveProjectUseCase {
  constructor(
    private readonly projectRepo: IProjectRepository,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(projectId: string, requestedBy: string): Promise<void> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }
    if (project.ownerId !== requestedBy) {
      throw new AuthorizationError('Only the project owner can archive it');
    }

    project.archive();
    await this.projectRepo.save(project);
    await this.auditRepo.save(AuditLog.create({
      action:       AuditAction.PROJECT_ARCHIVED,
      actorId:      requestedBy,
      resourceType: 'Project',
      resourceId:   projectId,
    }));
  }
}
