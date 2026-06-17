import {
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  BusinessRuleError,
  TargetNotAuthorizedError,
  InfrastructureError,
} from '@domain/errors';

describe('Domain Errors', () => {
  describe('ValidationError', () => {
    it('carries the correct code and HTTP status', () => {
      const error = new ValidationError('Invalid input');

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.httpStatus).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error).toBeInstanceOf(Error);
    });

    it('carries optional field-level errors', () => {
      const error = new ValidationError('Invalid input', { email: ['Invalid format'] });

      expect(error.fieldErrors).toEqual({ email: ['Invalid format'] });
    });
  });

  describe('NotFoundError', () => {
    it('builds a descriptive message from resource and identifier', () => {
      const error = new NotFoundError('Scan', 'abc-123');

      expect(error.message).toBe('Scan with identifier "abc-123" was not found.');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.httpStatus).toBe(404);
    });
  });

  describe('AuthenticationError', () => {
    it('defaults to a generic message', () => {
      const error = new AuthenticationError();

      expect(error.httpStatus).toBe(401);
      expect(error.message).toBe('Authentication is required.');
    });

    it('accepts a custom message', () => {
      const error = new AuthenticationError('Token expired');

      expect(error.message).toBe('Token expired');
    });
  });

  describe('AuthorizationError', () => {
    it('defaults to a generic message and 403 status', () => {
      const error = new AuthorizationError();

      expect(error.httpStatus).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });
  });

  describe('ConflictError', () => {
    it('carries a 409 status', () => {
      const error = new ConflictError('Duplicate target URL');

      expect(error.httpStatus).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });
  });

  describe('BusinessRuleError', () => {
    it('carries a 422 status', () => {
      const error = new BusinessRuleError('Rule violated');

      expect(error.httpStatus).toBe(422);
      expect(error.code).toBe('BUSINESS_RULE_VIOLATION');
    });
  });

  describe('TargetNotAuthorizedError', () => {
    it('extends BusinessRuleError with a specific code', () => {
      const error = new TargetNotAuthorizedError('https://example.com');

      expect(error).toBeInstanceOf(BusinessRuleError);
      expect(error.code).toBe('TARGET_NOT_AUTHORIZED');
      expect(error.httpStatus).toBe(422);
      expect(error.message).toContain('https://example.com');
    });
  });

  describe('InfrastructureError', () => {
    it('carries a 500 status', () => {
      const error = new InfrastructureError('DB query failed');

      expect(error.httpStatus).toBe(500);
      expect(error.code).toBe('INFRASTRUCTURE_ERROR');
    });

    it('preserves the original cause for internal logging', () => {
      const original = new Error('Connection refused');
      const error = new InfrastructureError('DB query failed', original);

      expect(error.cause).toBe(original);
    });

    it('leaves cause undefined when none is provided', () => {
      const error = new InfrastructureError('DB query failed');

      expect(error.cause).toBeUndefined();
    });
  });
});
