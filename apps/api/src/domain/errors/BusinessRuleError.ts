import { DomainError } from './DomainError';

export class BusinessRuleError extends DomainError {
  readonly code: string = 'BUSINESS_RULE_VIOLATION';
  readonly httpStatus = 422;

  constructor(message: string) {
    super(message);
  }
}
