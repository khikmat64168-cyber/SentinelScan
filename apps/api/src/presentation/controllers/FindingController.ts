import type { Request, Response } from 'express';
import type { ListFindingsUseCase } from '@application/finding/ListFindingsUseCase';
import type { SeverityLevel } from '@domain/value-objects/Severity';

export class FindingController {
  constructor(private readonly listUseCase: ListFindingsUseCase) {}

  listByScan = async (req: Request, res: Response): Promise<void> => {
    const severityLevel = req.query['severity'] as SeverityLevel | undefined;
    const findings = await this.listUseCase.execute({
      scanId:        req.params['scanId'] as string,
      severityLevel,
    });
    res.json(findings.map((f) => ({
      id:             f.id,
      scanId:         f.scanId,
      targetId:       f.targetId,
      pluginId:       f.pluginId,
      title:          f.title,
      description:    f.description,
      type:           f.type,
      severity:       f.severity.value,
      cvssScore:      f.cvssScore?.value ?? null,
      evidence:       f.evidence,
      recommendation: f.recommendation,
      affectedUrl:    f.affectedUrl,
      createdAt:      f.createdAt,
    })));
  };
}
