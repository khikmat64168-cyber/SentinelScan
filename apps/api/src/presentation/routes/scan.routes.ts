import { Router } from 'express';
import type { RequestHandler } from 'express';
import { validate } from '../middleware/validate';
import { startScanSchema } from '../schemas/scan.schema';
import type { ScanController } from '../controllers/ScanController';

export function createScanRouter(
  controller:   ScanController,
  authenticate: RequestHandler,
): Router {
  const router = Router({ mergeParams: true });
  router.use(authenticate);

  // POST /api/v1/scans
  router.post('/', validate(startScanSchema), controller.start);
  // GET  /api/v1/scans/:id
  router.get('/:id', controller.getById);
  // DELETE /api/v1/scans/:id  (cancel)
  router.delete('/:id', controller.cancel);

  return router;
}

export function createScansByProjectRouter(
  controller:   ScanController,
  authenticate: RequestHandler,
): Router {
  const router = Router({ mergeParams: true });
  router.use(authenticate);

  // GET /api/v1/projects/:projectId/scans
  router.get('/', controller.listByProject);

  return router;
}
