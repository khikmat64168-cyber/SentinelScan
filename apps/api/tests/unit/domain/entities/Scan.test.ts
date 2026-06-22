import { Scan, ScanStatus } from '@domain/entities/Scan';
import { BusinessRuleError } from '@domain/errors';

const BASE = {
  targetId:  'target-1',
  projectId: 'project-1',
  createdBy: 'user-1',
  pluginIds: ['headers', 'ssl'],
};

describe('Scan', () => {
  describe('create()', () => {
    it('starts in PENDING status', () => {
      expect(Scan.create(BASE).status).toBe(ScanStatus.PENDING);
    });

    it('copies pluginIds defensively', () => {
      const ids = ['a', 'b'];
      const scan = Scan.create({ ...BASE, pluginIds: ids });
      ids.push('c');
      expect(scan.pluginIds).toHaveLength(2);
    });
  });

  describe('state machine — valid transitions', () => {
    it('PENDING → RUNNING', () => {
      const scan = Scan.create(BASE);
      scan.start();
      expect(scan.status).toBe(ScanStatus.RUNNING);
      expect(scan.startedAt).toBeInstanceOf(Date);
    });

    it('RUNNING → COMPLETED', () => {
      const scan = Scan.create(BASE);
      scan.start();
      scan.complete();
      expect(scan.status).toBe(ScanStatus.COMPLETED);
      expect(scan.completedAt).toBeInstanceOf(Date);
    });

    it('RUNNING → FAILED with message', () => {
      const scan = Scan.create(BASE);
      scan.start();
      scan.fail('connection refused');
      expect(scan.status).toBe(ScanStatus.FAILED);
      expect(scan.errorMessage).toBe('connection refused');
    });

    it('PENDING → CANCELLED', () => {
      const scan = Scan.create(BASE);
      scan.cancel();
      expect(scan.status).toBe(ScanStatus.CANCELLED);
    });

    it('RUNNING → CANCELLED', () => {
      const scan = Scan.create(BASE);
      scan.start();
      scan.cancel();
      expect(scan.status).toBe(ScanStatus.CANCELLED);
    });
  });

  describe('state machine — illegal transitions', () => {
    it('throws when going PENDING → COMPLETED directly', () => {
      const scan = Scan.create(BASE);
      expect(() => scan.complete()).toThrow(BusinessRuleError);
    });

    it('throws when going COMPLETED → RUNNING', () => {
      const scan = Scan.create(BASE);
      scan.start();
      scan.complete();
      expect(() => scan.start()).toThrow(BusinessRuleError);
    });

    it('throws when going FAILED → CANCELLED', () => {
      const scan = Scan.create(BASE);
      scan.start();
      scan.fail('oops');
      expect(() => scan.cancel()).toThrow(BusinessRuleError);
    });
  });

  describe('isTerminal()', () => {
    it('returns false for PENDING', () => {
      expect(Scan.create(BASE).isTerminal()).toBe(false);
    });

    it('returns false for RUNNING', () => {
      const scan = Scan.create(BASE);
      scan.start();
      expect(scan.isTerminal()).toBe(false);
    });

    it('returns true for COMPLETED', () => {
      const scan = Scan.create(BASE);
      scan.start();
      scan.complete();
      expect(scan.isTerminal()).toBe(true);
    });

    it('returns true for FAILED', () => {
      const scan = Scan.create(BASE);
      scan.start();
      scan.fail('err');
      expect(scan.isTerminal()).toBe(true);
    });

    it('returns true for CANCELLED', () => {
      const scan = Scan.create(BASE);
      scan.cancel();
      expect(scan.isTerminal()).toBe(true);
    });
  });
});
