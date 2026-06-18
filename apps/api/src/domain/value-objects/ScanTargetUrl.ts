import { ValidationError } from '../errors/ValidationError';
import { TargetNotAuthorizedError } from '../errors/TargetNotAuthorizedError';

// Hostname patterns that must never be scanned — SSRF prevention gate.
// DNS-based bypass is handled separately at the HTTP-client layer before
// each outbound request (re-resolving the hostname prevents time-of-check
// / time-of-use races).
const BLOCKED_HOSTNAME_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,   // loopback
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,    // RFC-1918 class A
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/, // RFC-1918 class B
  /^192\.168\.\d{1,3}\.\d{1,3}$/,        // RFC-1918 class C
  /^169\.254\.\d{1,3}\.\d{1,3}$/,        // link-local / cloud IMDS
  /^0\.0\.0\.0$/,
  /^\[::1\]$/,                            // IPv6 loopback (WHATWG URL preserves brackets)
  /^\[fc[\da-f]{2}:/i,                   // IPv6 ULA
  /^\[fe80:/i,                            // IPv6 link-local
  /^metadata\.google\.internal$/i,        // GCP metadata endpoint
];

export class ScanTargetUrl {
  private readonly _url: URL;

  private constructor(url: URL) {
    this._url = url;
  }

  static create(rawUrl: string): ScanTargetUrl {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      throw new ValidationError(`Invalid URL: "${rawUrl}"`);
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new ValidationError(
        `URL must use http or https scheme, got: "${parsed.protocol.replace(':', '')}"`,
      );
    }

    const hostname = parsed.hostname;
    for (const pattern of BLOCKED_HOSTNAME_PATTERNS) {
      if (pattern.test(hostname)) {
        throw new TargetNotAuthorizedError(rawUrl);
      }
    }

    return new ScanTargetUrl(parsed);
  }

  get value(): string {
    return this._url.href;
  }

  get hostname(): string {
    return this._url.hostname;
  }

  get protocol(): string {
    return this._url.protocol;
  }

  equals(other: ScanTargetUrl): boolean {
    return this._url.href === other._url.href;
  }

  toString(): string {
    return this._url.href;
  }
}
