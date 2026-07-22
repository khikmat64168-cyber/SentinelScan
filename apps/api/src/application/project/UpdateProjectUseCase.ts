import type { IProjectRepository } from '@domain/repositories/IProjectRepository';
import type { Project } from '@domain/entities/Project';
import { NotFoundError } from '@domain/errors';

export interface UpdateProjectCommand {
  projectId:   string;
  name?:       string;
  description?: string;
}

export class UpdateProjectUseCase {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async execute(cmd: UpdateProjectCommand): Promise<Project> {
    const project = await this.projectRepo.findById(cmd.projectId);
    if (!project) {
      throw new NotFoundError('Project', cmd.projectId);
    }
    if (cmd.name !== undefined) { project.rename(cmd.name); }
    if (cmd.description !== undefined) { project.updateDescription(cmd.description); }
    await this.projectRepo.save(project);
    return project;
  }
}
