import { DomainError } from './DomainError';

export class AuthorizationError extends DomainError {
  readonly code = 'FORBIDDEN';
  readonly httpStatus = 403;

  constructor(message = 'You do not have permission to perform this action.') {
    super(message);
  }
}
