import type { RequestHandler } from 'express';
import { AuthenticationError, AuthorizationError } from '@domain/errors';
import type { UserRole } from '@domain/entities/User';

export function authorize(...roles: UserRole[]): RequestHandler {
  return (req, _res, next): void => {
    if (!req.user) {
      next(new AuthenticationError('Not authenticated'));
      return;
    }
    if (!req.user.hasRole(...roles)) {
      next(new AuthorizationError(`Access requires one of: ${roles.join(', ')}`));
      return;
    }
    next();
  };
}
