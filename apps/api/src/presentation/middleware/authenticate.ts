import type { RequestHandler } from 'express';
import { AuthenticationError } from '@domain/errors';
import type { AuthService } from '@application/auth/AuthService';

export function createAuthMiddleware(authService: AuthService): RequestHandler {
  return async (req, _res, next): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      next(new AuthenticationError('Missing or invalid Authorization header'));
      return;
    }
    try {
      req.user = await authService.validateAccessToken(header.slice(7));
      next();
    } catch (err) {
      next(err);
    }
  };
}
