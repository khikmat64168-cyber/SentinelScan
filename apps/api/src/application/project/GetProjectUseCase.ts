import type { IProjectRepository } from '@domain/repositories/IProjectRepository';
import type { Project } from '@domain/entities/Project';
import { NotFoundError } from '@domain/errors';

export class GetProjectUseCase {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async execute(projectId: string): Promise<Project> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }
    return project;
  }
}
