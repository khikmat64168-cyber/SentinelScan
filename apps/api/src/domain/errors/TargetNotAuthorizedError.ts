import { BusinessRuleError } from './BusinessRuleError';

/**
 * Thrown when a scan is requested against a target that has not been
 * explicitly marked `is_authorized = true`. This is the core safety gate
 * that prevents the scanner from ever touching an unauthorized system.
 */
export class TargetNotAuthorizedError extends BusinessRuleError {
  override readonly code = 'TARGET_NOT_AUTHORIZED';

  constructor(targetUrl: string) {
    super(`Target "${targetUrl}" must be explicitly authorized before it can be scanned.`);
  }
}
