import { DomainError } from './DomainError';

/**
 * Wraps any failure originating from infrastructure (database, cache, queue,
 * outbound HTTP). Repositories and adapters must catch driver-specific
 * errors and rethrow as InfrastructureError so the domain never depends on
 * a specific driver's error shape.
 */
export class InfrastructureError extends DomainError {
  readonly code = 'INFRASTRUCTURE_ERROR';
  readonly httpStatus = 500;

  constructor(message: string, cause?: unknown) {
    super(message);
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}
