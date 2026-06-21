import { Target } from '@domain/entities/Target';
import { BusinessRuleError } from '@domain/errors';
import { TargetNotAuthorizedError } from '@domain/errors/TargetNotAuthorizedError';
import { ValidationError } from '@domain/errors/ValidationError';

const PROJECT_ID = 'proj-uuid-123';
const USER_ID    = 'user-uuid-456';
const PUBLIC_URL = 'https://example.com';

describe('Target', () => {
  describe('create()', () => {
    it('creates a target with a valid URL', () => {
      const t = Target.create({ url: PUBLIC_URL, projectId: PROJECT_ID });
      expect(t.url.hostname).toBe('example.com');
      expect(t.projectId).toBe(PROJECT_ID);
    });

    it('starts unauthorized', () => {
      const t = Target.create({ url: PUBLIC_URL, projectId: PROJECT_ID });
      expect(t.isAuthorized).toBe(false);
      expect(t.authorizedAt).toBeNull();
      expect(t.authorizedBy).toBeNull();
    });

    it('rejects private IP (SSRF)', () => {
      expect(() => Target.create({ url: 'http://192.168.1.1', projectId: PROJECT_ID }))
        .toThrow(TargetNotAuthorizedError);
    });

    it('rejects invalid URL', () => {
      expect(() => Target.create({ url: 'not-a-url', projectId: PROJECT_ID }))
        .toThrow(ValidationError);
    });
  });

  describe('authorize()', () => {
    it('marks the target authorized', () => {
      const t = Target.create({ url: PUBLIC_URL, projectId: PROJECT_ID });
      t.authorize(USER_ID);
      expect(t.isAuthorized).toBe(true);
      expect(t.authorizedBy).toBe(USER_ID);
      expect(t.authorizedAt).toBeInstanceOf(Date);
    });
  });

  describe('revokeAuthorization()', () => {
    it('clears authorization', () => {
      const t = Target.create({ url: PUBLIC_URL, projectId: PROJECT_ID });
      t.authorize(USER_ID);
      t.revokeAuthorization();
      expect(t.isAuthorized).toBe(false);
      expect(t.authorizedAt).toBeNull();
      expect(t.authorizedBy).toBeNull();
    });
  });

  describe('assertAuthorized()', () => {
    it('does not throw when authorized', () => {
      const t = Target.create({ url: PUBLIC_URL, projectId: PROJECT_ID });
      t.authorize(USER_ID);
      expect(() => t.assertAuthorized()).not.toThrow();
    });

    it('throws BusinessRuleError when not authorized', () => {
      const t = Target.create({ url: PUBLIC_URL, projectId: PROJECT_ID });
      expect(() => t.assertAuthorized()).toThrow(BusinessRuleError);
    });
  });
});
