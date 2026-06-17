/**
 * Base class for every error the domain and application layers throw.
 * Infrastructure-layer failures (DB, network, etc.) must be wrapped in
 * InfrastructureError before crossing into this layer — raw driver errors
 * never propagate past the repository boundary.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
