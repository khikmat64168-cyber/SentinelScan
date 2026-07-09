import type { IProjectRepository } from '@domain/repositories/IProjectRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { Project } from '@domain/entities/Project';
import { AuditLog, AuditAction } from '@domain/entities/AuditLog';

export interface CreateProjectCommand {
  name: string;
  description?: string;
  ownerId: string;
}

export interface CreateProjectResult {
  projectId: string;
  name: string;
}

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepo: IProjectRepository,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(cmd: CreateProjectCommand): Promise<CreateProjectResult> {
    const project = Project.create({ name: cmd.name, description: cmd.description, ownerId: cmd.ownerId });

    await this.projectRepo.save(project);
    await this.auditRepo.save(AuditLog.create({
      action:       AuditAction.PROJECT_CREATED,
      actorId:      cmd.ownerId,
      resourceType: 'Project',
      resourceId:   project.id,
    }));

    return { projectId: project.id, name: project.name };
  }
}
