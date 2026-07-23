import { Router } from 'express';
import type { RequestHandler } from 'express';
import { validate } from '../middleware/validate';
import { generateReportSchema } from '../schemas/report.schema';
import type { ReportController } from '../controllers/ReportController';

export function createReportRouter(
  controller:   ReportController,
  authenticate: RequestHandler,
): Router {
  const router = Router();
  router.use(authenticate);

  // POST /api/v1/reports
  router.post('/', validate(generateReportSchema), controller.generate);
  // GET  /api/v1/reports/:id
  router.get('/:id', controller.getById);

  return router;
}
