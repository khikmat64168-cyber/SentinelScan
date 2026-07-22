import type { Request, Response } from 'express';
import type { CreateProjectUseCase } from '@application/project/CreateProjectUseCase';
import type { GetProjectUseCase } from '@application/project/GetProjectUseCase';
import type { ListProjectsUseCase } from '@application/project/ListProjectsUseCase';
import type { UpdateProjectUseCase } from '@application/project/UpdateProjectUseCase';
import type { ArchiveProjectUseCase } from '@application/project/ArchiveProjectUseCase';
import type { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';

function serializeProject(p: {
  id: string; name: string; description: string; ownerId: string;
  isArchived: boolean; createdAt: Date; updatedAt: Date;
}): Record<string, unknown> {
  return {
    id:          p.id,
    name:        p.name,
    description: p.description,
    ownerId:     p.ownerId,
    isArchived:  p.isArchived,
    createdAt:   p.createdAt,
    updatedAt:   p.updatedAt,
  };
}

export class ProjectController {
  constructor(
    private readonly createUseCase:  CreateProjectUseCase,
    private readonly getUseCase:     GetProjectUseCase,
    private readonly listUseCase:    ListProjectsUseCase,
    private readonly updateUseCase:  UpdateProjectUseCase,
    private readonly archiveUseCase: ArchiveProjectUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as CreateProjectInput;
    const result = await this.createUseCase.execute({
      name:        body.name,
      description: body.description,
      ownerId:     req.user!.id,
    });
    res.status(201).json(result);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const projects = await this.listUseCase.execute(req.user!.id);
    res.json(projects.map(serializeProject));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const project = await this.getUseCase.execute(req.params['id'] as string);
    res.json(serializeProject(project));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as UpdateProjectInput;
    const project = await this.updateUseCase.execute({
      projectId:   req.params['id'] as string,
      name:        body.name,
      description: body.description,
    });
    res.json(serializeProject(project));
  };

  archive = async (req: Request, res: Response): Promise<void> => {
    await this.archiveUseCase.execute(req.params['id'] as string, req.user!.id);
    res.status(204).send();
  };
}
