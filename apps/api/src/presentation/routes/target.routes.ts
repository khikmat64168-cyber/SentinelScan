import { Router } from 'express';
import type { RequestHandler } from 'express';
import { validate } from '../middleware/validate';
import { createTargetSchema } from '../schemas/target.schema';
import type { TargetController } from '../controllers/TargetController';

export function createTargetRouter(
  controller:   TargetController,
  authenticate: RequestHandler,
): Router {
  const router = Router({ mergeParams: true });
  router.use(authenticate);

  // GET /api/v1/projects/:projectId/targets
  router.get('/', controller.listByProject);
  // POST /api/v1/targets  (projectId is in the body)
  router.post('/', validate(createTargetSchema), controller.create);
  // POST /api/v1/targets/:id/authorize
  router.post('/:id/authorize', controller.authorize);

  return router;
}
