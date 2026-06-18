import { ScanTargetUrl } from '@domain/value-objects/ScanTargetUrl';
import { ValidationError } from '@domain/errors/ValidationError';
import { TargetNotAuthorizedError } from '@domain/errors/TargetNotAuthorizedError';

describe('ScanTargetUrl', () => {
  describe('valid public targets', () => {
    it('accepts an https URL', () => {
      const url = ScanTargetUrl.create('https://example.com');
      expect(url.value).toBe('https://example.com/');
      expect(url.protocol).toBe('https:');
      expect(url.hostname).toBe('example.com');
    });

    it('accepts an http URL', () => {
      const url = ScanTargetUrl.create('http://example.com/path?q=1');
      expect(url.hostname).toBe('example.com');
    });

    it('accepts a public IP address', () => {
      expect(() => ScanTargetUrl.create('https://8.8.8.8')).not.toThrow();
    });
  });

  describe('invalid URL format', () => {
    it('throws ValidationError for a non-parseable string', () => {
      expect(() => ScanTargetUrl.create('not-a-url')).toThrow(ValidationError);
    });

    it('throws ValidationError for empty string', () => {
      expect(() => ScanTargetUrl.create('')).toThrow(ValidationError);
    });
  });

  describe('disallowed schemes', () => {
    it('throws ValidationError for ftp://', () => {
      expect(() => ScanTargetUrl.create('ftp://example.com')).toThrow(ValidationError);
    });

    it('throws ValidationError for file://', () => {
      expect(() => ScanTargetUrl.create('file:///etc/passwd')).toThrow(ValidationError);
    });
  });

  describe('SSRF — loopback', () => {
    it('blocks localhost', () => {
      expect(() => ScanTargetUrl.create('http://localhost')).toThrow(TargetNotAuthorizedError);
    });

    it('blocks 127.0.0.1', () => {
      expect(() => ScanTargetUrl.create('http://127.0.0.1')).toThrow(TargetNotAuthorizedError);
    });

    it('blocks 127.x.x.x range', () => {
      expect(() => ScanTargetUrl.create('http://127.255.255.255')).toThrow(TargetNotAuthorizedError);
    });

    it('blocks IPv6 loopback ::1', () => {
      expect(() => ScanTargetUrl.create('http://[::1]')).toThrow(TargetNotAuthorizedError);
    });
  });

  describe('SSRF — private ranges', () => {
    it('blocks 10.x.x.x (RFC-1918 class A)', () => {
      expect(() => ScanTargetUrl.create('http://10.0.0.1')).toThrow(TargetNotAuthorizedError);
    });

    it('blocks 172.16.x.x (RFC-1918 class B)', () => {
      expect(() => ScanTargetUrl.create('http://172.16.0.1')).toThrow(TargetNotAuthorizedError);
    });

    it('blocks 172.31.x.x (RFC-1918 class B upper boundary)', () => {
      expect(() => ScanTargetUrl.create('http://172.31.255.255')).toThrow(TargetNotAuthorizedError);
    });

    it('does NOT block 172.32.x.x (outside RFC-1918 class B)', () => {
      expect(() => ScanTargetUrl.create('http://172.32.0.1')).not.toThrow();
    });

    it('blocks 192.168.x.x (RFC-1918 class C)', () => {
      expect(() => ScanTargetUrl.create('http://192.168.1.1')).toThrow(TargetNotAuthorizedError);
    });
  });

  describe('SSRF — link-local / cloud metadata', () => {
    it('blocks 169.254.x.x (AWS/Azure/GCP IMDS)', () => {
      expect(() => ScanTargetUrl.create('http://169.254.169.254')).toThrow(TargetNotAuthorizedError);
    });

    it('blocks metadata.google.internal', () => {
      expect(() => ScanTargetUrl.create('http://metadata.google.internal')).toThrow(TargetNotAuthorizedError);
    });

    it('blocks 0.0.0.0', () => {
      expect(() => ScanTargetUrl.create('http://0.0.0.0')).toThrow(TargetNotAuthorizedError);
    });
  });

  describe('equals()', () => {
    it('returns true for the same URL', () => {
      const a = ScanTargetUrl.create('https://example.com/');
      const b = ScanTargetUrl.create('https://example.com/');
      expect(a.equals(b)).toBe(true);
    });

    it('returns false for different URLs', () => {
      const a = ScanTargetUrl.create('https://example.com/');
      const b = ScanTargetUrl.create('https://other.com/');
      expect(a.equals(b)).toBe(false);
    });
  });
});
