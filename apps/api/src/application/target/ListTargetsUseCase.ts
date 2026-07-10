import type { ITargetRepository } from '@domain/repositories/ITargetRepository';
import type { Target } from '@domain/entities/Target';

export class ListTargetsUseCase {
  constructor(private readonly targetRepo: ITargetRepository) {}

  async execute(projectId: string): Promise<Target[]> {
    return this.targetRepo.findByProjectId(projectId);
  }
}
