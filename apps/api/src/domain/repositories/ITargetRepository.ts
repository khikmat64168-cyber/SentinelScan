import type { Target } from '../entities/Target';

export interface ITargetRepository {
  findById(id: string): Promise<Target | null>;
  findByProjectId(projectId: string): Promise<Target[]>;
  save(target: Target): Promise<void>;
  delete(id: string): Promise<void>;
}
