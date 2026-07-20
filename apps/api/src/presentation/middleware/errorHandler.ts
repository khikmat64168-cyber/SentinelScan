import type { Request, Response, NextFunction } from 'express';
import { DomainError } from '@domain/errors/DomainError';
import { ValidationError } from '@domain/errors/ValidationError';
import { logger } from '@shared/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof DomainError) {
    const body: Record<string, unknown> = {
      code:    err.code,
      message: err.message,
    };

    if (err instanceof ValidationError && err.fieldErrors) {
      body['fields'] = err.fieldErrors;
    }

    res.status(err.httpStatus).json({ error: body });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
}
