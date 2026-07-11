import type { IScanRepository } from '@domain/repositories/IScanRepository';
import type { Scan } from '@domain/entities/Scan';
import { NotFoundError } from '@domain/errors';

export class GetScanUseCase {
  constructor(private readonly scanRepo: IScanRepository) {}

  async execute(scanId: string): Promise<Scan> {
    const scan = await this.scanRepo.findById(scanId);
    if (!scan) {
      throw new NotFoundError('Scan', scanId);
    }
    return scan;
  }
}
