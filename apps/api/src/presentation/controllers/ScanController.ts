import type { Request, Response } from 'express';
import type { StartScanUseCase } from '@application/scan/StartScanUseCase';
import type { CancelScanUseCase } from '@application/scan/CancelScanUseCase';
import type { GetScanUseCase } from '@application/scan/GetScanUseCase';
import type { ListScansUseCase } from '@application/scan/ListScansUseCase';
import type { ScanStatus } from '@domain/entities/Scan';
import type { StartScanInput } from '../schemas/scan.schema';

export class ScanController {
  constructor(
    private readonly startUseCase:  StartScanUseCase,
    private readonly cancelUseCase: CancelScanUseCase,
    private readonly getUseCase:    GetScanUseCase,
    private readonly listUseCase:   ListScansUseCase,
  ) {}

  start = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as StartScanInput;
    const scan = await this.startUseCase.execute({
      targetId:  body.targetId,
      projectId: body.projectId,
      createdBy: req.user!.id,
      pluginIds: body.pluginIds,
    });
    res.status(201).json(this._serialize(scan));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const scan = await this.getUseCase.execute(req.params['id'] as string);
    res.json(this._serialize(scan));
  };

  listByProject = async (req: Request, res: Response): Promise<void> => {
    const status = req.query['status'] as ScanStatus | undefined;
    const scans = await this.listUseCase.execute(req.params['projectId'] as string, status);
    res.json(scans.map((s) => this._serialize(s)));
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    await this.cancelUseCase.execute(req.params['id'] as string, req.user!.id);
    res.status(204).send();
  };

  private _serialize(scan: {
    id: string; targetId: string; projectId: string; createdBy: string;
    pluginIds: string[]; status: string; startedAt: Date | null;
    completedAt: Date | null; errorMessage: string | null; createdAt: Date;
  }): Record<string, unknown> {
    return {
      id:           scan.id,
      targetId:     scan.targetId,
      projectId:    scan.projectId,
      createdBy:    scan.createdBy,
      pluginIds:    scan.pluginIds,
      status:       scan.status,
      startedAt:    scan.startedAt,
      completedAt:  scan.completedAt,
      errorMessage: scan.errorMessage,
      createdAt:    scan.createdAt,
    };
  }
}
