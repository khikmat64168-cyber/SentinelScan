import { ValidationError } from '../errors';
import { Severity, SeverityLevel } from './Severity';

export class CvssScore {
  private constructor(private readonly _score: number) {}

  static of(score: number): CvssScore {
    if (score < 0 || score > 10) {
      throw new ValidationError(`CVSS score must be between 0.0 and 10.0, got: ${String(score)}`);
    }
    return new CvssScore(Math.round(score * 10) / 10);
  }

  get value(): number {
    return this._score;
  }

  toSeverity(): Severity {
    if (this._score >= 9.0) { return Severity.of(SeverityLevel.CRITICAL); }
    if (this._score >= 7.0) { return Severity.of(SeverityLevel.HIGH); }
    if (this._score >= 4.0) { return Severity.of(SeverityLevel.MEDIUM); }
    if (this._score >= 0.1) { return Severity.of(SeverityLevel.LOW); }
    return Severity.of(SeverityLevel.INFORMATIONAL);
  }

  equals(other: CvssScore): boolean {
    return this._score === other._score;
  }

  toString(): string {
    return this._score.toFixed(1);
  }
}
