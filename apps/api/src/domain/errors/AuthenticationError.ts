import { DomainError } from './DomainError';

export class AuthenticationError extends DomainError {
  readonly code = 'UNAUTHENTICATED';
  readonly httpStatus = 401;

  constructor(message = 'Authentication is required.') {
    super(message);
  }
}
