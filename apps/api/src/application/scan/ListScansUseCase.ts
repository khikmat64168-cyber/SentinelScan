import type { IScanRepository } from '@domain/repositories/IScanRepository';
import type { Scan, ScanStatus } from '@domain/entities/Scan';

export class ListScansUseCase {
  constructor(private readonly scanRepo: IScanRepository) {}

  async execute(projectId: string, status?: ScanStatus): Promise<Scan[]> {
    return this.scanRepo.findByProjectId(projectId, status);
  }
}
