import { Router } from 'express';
import type { RequestHandler } from 'express';
import { validate } from '../middleware/validate';
import { loginSchema, refreshSchema, registerSchema } from '../schemas/auth.schema';
import type { AuthController } from '../controllers/AuthController';

export function createAuthRouter(
  controller:   AuthController,
  authenticate: RequestHandler,
): Router {
  const router = Router();

  router.post('/register', validate(registerSchema), controller.register);
  router.post('/login',    validate(loginSchema),    controller.login);
  router.post('/logout',   authenticate, validate(refreshSchema), controller.logout);
  router.post('/refresh',  validate(refreshSchema),  controller.refresh);

  return router;
}
