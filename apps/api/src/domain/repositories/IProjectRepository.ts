import type { Project } from '../entities/Project';

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByOwnerId(ownerId: string): Promise<Project[]>;
  save(project: Project): Promise<void>;
  delete(id: string): Promise<void>;
}
