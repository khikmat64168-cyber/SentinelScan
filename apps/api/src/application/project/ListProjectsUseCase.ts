import type { IProjectRepository } from '@domain/repositories/IProjectRepository';
import type { Project } from '@domain/entities/Project';

export class ListProjectsUseCase {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async execute(ownerId: string): Promise<Project[]> {
    return this.projectRepo.findByOwnerId(ownerId);
  }
}
