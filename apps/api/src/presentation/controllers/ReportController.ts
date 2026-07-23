import type { Request, Response } from 'express';
import type { GenerateReportUseCase } from '@application/report/GenerateReportUseCase';
import type { GetReportUseCase } from '@application/report/GetReportUseCase';
import type { ReportFormat } from '@domain/entities/Report';
import type { GenerateReportInput } from '../schemas/report.schema';

export class ReportController {
  constructor(
    private readonly generateUseCase: GenerateReportUseCase,
    private readonly getUseCase:      GetReportUseCase,
  ) {}

  generate = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as GenerateReportInput;
    const report = await this.generateUseCase.execute({
      scanId:    body.scanId,
      projectId: body.projectId,
      createdBy: req.user!.id,
      format:    body.format as ReportFormat,
    });
    res.status(202).json(this._serialize(report));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const report = await this.getUseCase.execute(req.params['id'] as string);
    res.json(this._serialize(report));
  };

  private _serialize(report: {
    id: string; scanId: string; projectId: string; createdBy: string;
    format: string; status: string; storagePath: string | null;
    generatedAt: Date | null; createdAt: Date;
  }): Record<string, unknown> {
    return {
      id:          report.id,
      scanId:      report.scanId,
      projectId:   report.projectId,
      createdBy:   report.createdBy,
      format:      report.format,
      status:      report.status,
      storagePath: report.storagePath,
      generatedAt: report.generatedAt,
      createdAt:   report.createdAt,
    };
  }
}
