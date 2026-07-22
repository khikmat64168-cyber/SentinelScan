import { Router } from 'express';
import type { RequestHandler } from 'express';
import { validate } from '../middleware/validate';
import { createProjectSchema, updateProjectSchema } from '../schemas/project.schema';
import type { ProjectController } from '../controllers/ProjectController';

export function createProjectRouter(
  controller:   ProjectController,
  authenticate: RequestHandler,
): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/',    controller.list);
  router.post('/',   validate(createProjectSchema), controller.create);
  router.get('/:id', controller.getById);
  router.patch('/:id', validate(updateProjectSchema), controller.update);
  router.delete('/:id', controller.archive);

  return router;
}
