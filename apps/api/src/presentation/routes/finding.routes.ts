import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { FindingController } from '../controllers/FindingController';

export function createFindingRouter(
  controller:   FindingController,
  authenticate: RequestHandler,
): Router {
  const router = Router({ mergeParams: true });
  router.use(authenticate);

  // GET /api/v1/scans/:scanId/findings
  router.get('/', controller.listByScan);

  return router;
}
