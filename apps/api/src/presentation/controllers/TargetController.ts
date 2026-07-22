import type { Request, Response } from 'express';
import type { CreateTargetUseCase } from '@application/target/CreateTargetUseCase';
import type { AuthorizeTargetUseCase } from '@application/target/AuthorizeTargetUseCase';
import type { ListTargetsUseCase } from '@application/target/ListTargetsUseCase';
import type { CreateTargetInput } from '../schemas/target.schema';

export class TargetController {
  constructor(
    private readonly createUseCase:    CreateTargetUseCase,
    private readonly authorizeUseCase: AuthorizeTargetUseCase,
    private readonly listUseCase:      ListTargetsUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as CreateTargetInput;
    const result = await this.createUseCase.execute({
      url:       body.url,
      projectId: body.projectId,
      createdBy: req.user!.id,
    });
    res.status(201).json(result);
  };

  listByProject = async (req: Request, res: Response): Promise<void> => {
    const targets = await this.listUseCase.execute(req.params['projectId'] as string);
    res.json(targets.map((t) => ({
      id:           t.id,
      url:          t.url.value,
      projectId:    t.projectId,
      isAuthorized: t.isAuthorized,
      authorizedAt: t.authorizedAt,
      authorizedBy: t.authorizedBy,
      createdAt:    t.createdAt,
    })));
  };

  authorize = async (req: Request, res: Response): Promise<void> => {
    await this.authorizeUseCase.execute(req.params['id'] as string, req.user!.id);
    res.status(204).send();
  };
}
