import type { IFindingRepository, FindingFilter } from '@domain/repositories/IFindingRepository';
import type { Finding } from '@domain/entities/Finding';

export class ListFindingsUseCase {
  constructor(private readonly findingRepo: IFindingRepository) {}

  async execute(filter: FindingFilter): Promise<Finding[]> {
    return this.findingRepo.findByFilter(filter);
  }
}
