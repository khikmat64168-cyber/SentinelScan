import { ValidationError } from '../errors';

export enum SeverityLevel {
  CRITICAL      = 'CRITICAL',
  HIGH          = 'HIGH',
  MEDIUM        = 'MEDIUM',
  LOW           = 'LOW',
  INFORMATIONAL = 'INFORMATIONAL',
}

const ORDER: Record<SeverityLevel, number> = {
  [SeverityLevel.INFORMATIONAL]: 1,
  [SeverityLevel.LOW]:           2,
  [SeverityLevel.MEDIUM]:        3,
  [SeverityLevel.HIGH]:          4,
  [SeverityLevel.CRITICAL]:      5,
};

export class Severity {
  private constructor(private readonly _level: SeverityLevel) {}

  static of(level: SeverityLevel): Severity {
    return new Severity(level);
  }

  static fromString(value: string): Severity {
    const candidate = value.toUpperCase() as SeverityLevel;
    if (!Object.values(SeverityLevel).includes(candidate)) {
      throw new ValidationError(`Invalid severity level: "${value}"`);
    }
    return new Severity(candidate);
  }

  get value(): SeverityLevel {
    return this._level;
  }

  isAtLeast(other: Severity): boolean {
    return ORDER[this._level] >= ORDER[other._level];
  }

  compareTo(other: Severity): number {
    return ORDER[this._level] - ORDER[other._level];
  }

  equals(other: Severity): boolean {
    return this._level === other._level;
  }

  toString(): string {
    return this._level;
  }
}
