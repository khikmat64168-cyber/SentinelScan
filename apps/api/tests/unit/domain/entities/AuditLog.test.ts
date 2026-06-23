import { AuditLog, AuditAction } from '@domain/entities/AuditLog';

describe('AuditLog', () => {
  describe('create()', () => {
    it('stores required fields', () => {
      const log = AuditLog.create({
        action:       AuditAction.USER_LOGIN,
        actorId:      'user-1',
        resourceType: 'User',
        resourceId:   'user-1',
      });
      expect(log.action).toBe(AuditAction.USER_LOGIN);
      expect(log.actorId).toBe('user-1');
      expect(log.metadata).toEqual({});
      expect(log.ipAddress).toBeNull();
      expect(log.createdAt).toBeInstanceOf(Date);
    });

    it('stores optional ipAddress and metadata', () => {
      const log = AuditLog.create({
        action:       AuditAction.SCAN_STARTED,
        actorId:      'user-1',
        resourceType: 'Scan',
        resourceId:   'scan-1',
        ipAddress:    '203.0.113.5',
        metadata:     { pluginCount: 3 },
      });
      expect(log.ipAddress).toBe('203.0.113.5');
      expect(log.metadata).toEqual({ pluginCount: 3 });
    });

    it('generates a unique id', () => {
      const a = AuditLog.create({ action: AuditAction.USER_LOGIN, actorId: 'u', resourceType: 'User', resourceId: 'u' });
      const b = AuditLog.create({ action: AuditAction.USER_LOGIN, actorId: 'u', resourceType: 'User', resourceId: 'u' });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('rehydrate()', () => {
    it('restores all fields', () => {
      const now = new Date();
      const log = AuditLog.rehydrate({
        id:           'log-1',
        action:       AuditAction.TARGET_AUTHORIZED,
        actorId:      'user-2',
        resourceType: 'Target',
        resourceId:   'target-1',
        metadata:     { url: 'https://example.com' },
        ipAddress:    '10.0.0.1',
        createdAt:    now,
      });
      expect(log.id).toBe('log-1');
      expect(log.action).toBe(AuditAction.TARGET_AUTHORIZED);
    });
  });
});
