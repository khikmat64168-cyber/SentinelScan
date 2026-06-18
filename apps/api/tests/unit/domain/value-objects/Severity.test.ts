import { Severity, SeverityLevel } from '@domain/value-objects/Severity';
import { ValidationError } from '@domain/errors';

describe('Severity', () => {
  describe('of()', () => {
    it('creates a Severity for each level', () => {
      for (const level of Object.values(SeverityLevel)) {
        expect(Severity.of(level).value).toBe(level);
      }
    });
  });

  describe('fromString()', () => {
    it('parses a valid level case-insensitively', () => {
      expect(Severity.fromString('high').value).toBe(SeverityLevel.HIGH);
      expect(Severity.fromString('CRITICAL').value).toBe(SeverityLevel.CRITICAL);
      expect(Severity.fromString('Medium').value).toBe(SeverityLevel.MEDIUM);
    });

    it('throws ValidationError for unknown string', () => {
      expect(() => Severity.fromString('unknown')).toThrow(ValidationError);
    });
  });

  describe('isAtLeast()', () => {
    it('CRITICAL is at least CRITICAL', () => {
      expect(Severity.of(SeverityLevel.CRITICAL).isAtLeast(Severity.of(SeverityLevel.CRITICAL))).toBe(true);
    });

    it('CRITICAL is at least LOW', () => {
      expect(Severity.of(SeverityLevel.CRITICAL).isAtLeast(Severity.of(SeverityLevel.LOW))).toBe(true);
    });

    it('LOW is NOT at least HIGH', () => {
      expect(Severity.of(SeverityLevel.LOW).isAtLeast(Severity.of(SeverityLevel.HIGH))).toBe(false);
    });
  });

  describe('compareTo()', () => {
    it('returns positive when left > right', () => {
      expect(Severity.of(SeverityLevel.HIGH).compareTo(Severity.of(SeverityLevel.LOW))).toBeGreaterThan(0);
    });

    it('returns negative when left < right', () => {
      expect(Severity.of(SeverityLevel.LOW).compareTo(Severity.of(SeverityLevel.HIGH))).toBeLessThan(0);
    });

    it('returns 0 for equal levels', () => {
      expect(Severity.of(SeverityLevel.MEDIUM).compareTo(Severity.of(SeverityLevel.MEDIUM))).toBe(0);
    });
  });

  describe('equals()', () => {
    it('returns true for same level', () => {
      expect(Severity.of(SeverityLevel.HIGH).equals(Severity.of(SeverityLevel.HIGH))).toBe(true);
    });

    it('returns false for different level', () => {
      expect(Severity.of(SeverityLevel.HIGH).equals(Severity.of(SeverityLevel.LOW))).toBe(false);
    });
  });

  describe('toString()', () => {
    it('returns the level string', () => {
      expect(Severity.of(SeverityLevel.INFORMATIONAL).toString()).toBe('INFORMATIONAL');
    });
  });
});
