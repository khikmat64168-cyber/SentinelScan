import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { ValidationError } from '@domain/errors';

export function validate(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const [key, errors] of Object.entries(result.error.flatten().fieldErrors)) {
        // eslint-disable-next-line security/detect-object-injection
        if (errors) { fieldErrors[key] = errors; }
      }
      next(new ValidationError('Request body validation failed', fieldErrors));
      return;
    }
    req.body = result.data as Record<string, unknown>;
    next();
  };
}
