import { CvssScore } from '@domain/value-objects/CvssScore';
import { SeverityLevel } from '@domain/value-objects/Severity';
import { ValidationError } from '@domain/errors';

describe('CvssScore', () => {
  describe('of()', () => {
    it('accepts valid scores at boundaries', () => {
      expect(CvssScore.of(0).value).toBe(0);
      expect(CvssScore.of(10).value).toBe(10);
    });

    it('rounds to one decimal place', () => {
      expect(CvssScore.of(7.55).value).toBe(7.6);
    });

    it('throws ValidationError below 0', () => {
      expect(() => CvssScore.of(-0.1)).toThrow(ValidationError);
    });

    it('throws ValidationError above 10', () => {
      expect(() => CvssScore.of(10.1)).toThrow(ValidationError);
    });
  });

  describe('toSeverity()', () => {
    const cases: [number, SeverityLevel][] = [
      [9.0,  SeverityLevel.CRITICAL],
      [9.9,  SeverityLevel.CRITICAL],
      [7.0,  SeverityLevel.HIGH],
      [8.9,  SeverityLevel.HIGH],
      [4.0,  SeverityLevel.MEDIUM],
      [6.9,  SeverityLevel.MEDIUM],
      [0.1,  SeverityLevel.LOW],
      [3.9,  SeverityLevel.LOW],
      [0.0,  SeverityLevel.INFORMATIONAL],
    ];

    it.each(cases)('score %f maps to %s', (score, expected) => {
      expect(CvssScore.of(score).toSeverity().value).toBe(expected);
    });
  });

  describe('equals()', () => {
    it('returns true for same score', () => {
      expect(CvssScore.of(7.5).equals(CvssScore.of(7.5))).toBe(true);
    });

    it('returns false for different scores', () => {
      expect(CvssScore.of(7.5).equals(CvssScore.of(7.6))).toBe(false);
    });
  });

  describe('toString()', () => {
    it('formats to one decimal place', () => {
      expect(CvssScore.of(5).toString()).toBe('5.0');
      expect(CvssScore.of(9.5).toString()).toBe('9.5');
    });
  });
});
