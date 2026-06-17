import { DomainError } from './DomainError';

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly httpStatus = 404;

  constructor(resource: string, identifier: string) {
    super(`${resource} with identifier "${identifier}" was not found.`);
  }
}
