import { Finding, FindingType } from '@domain/entities/Finding';
import { Severity, SeverityLevel } from '@domain/value-objects/Severity';
import { CvssScore } from '@domain/value-objects/CvssScore';

const BASE: Parameters<typeof Finding.create>[0] = {
  scanId:      'scan-1',
  targetId:    'target-1',
  pluginId:    'headers-plugin',
  title:       'Missing X-Frame-Options',
  description: 'The response is missing the X-Frame-Options header.',
  type:        FindingType.MISSING_SECURITY_HEADER,
  severity:    Severity.of(SeverityLevel.MEDIUM),
};

describe('Finding', () => {
  describe('create()', () => {
    it('stores all required fields', () => {
      const f = Finding.create(BASE);
      expect(f.scanId).toBe('scan-1');
      expect(f.type).toBe(FindingType.MISSING_SECURITY_HEADER);
      expect(f.severity.value).toBe(SeverityLevel.MEDIUM);
    });

    it('defaults optional fields to null', () => {
      const f = Finding.create(BASE);
      expect(f.cvssScore).toBeNull();
      expect(f.evidence).toBeNull();
      expect(f.recommendation).toBeNull();
      expect(f.affectedUrl).toBeNull();
    });

    it('stores optional cvssScore', () => {
      const f = Finding.create({ ...BASE, cvssScore: CvssScore.of(5.3) });
      expect(f.cvssScore?.value).toBe(5.3);
    });

    it('generates a unique id', () => {
      const a = Finding.create(BASE);
      const b = Finding.create(BASE);
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('rehydrate()', () => {
    it('restores severity from persisted level', () => {
      const f = Finding.rehydrate({
        id:             'f-1',
        scanId:         'scan-1',
        targetId:       'target-1',
        pluginId:       'plugin-1',
        title:          'XSS',
        description:    'Reflected XSS',
        type:           FindingType.XSS,
        severityLevel:  SeverityLevel.HIGH,
        cvssScore:      7.5,
        evidence:       'param=<script>',
        recommendation: 'Sanitise output',
        affectedUrl:    'https://example.com/search',
        createdAt:      new Date(),
      });
      expect(f.severity.value).toBe(SeverityLevel.HIGH);
      expect(f.cvssScore?.value).toBe(7.5);
      expect(f.evidence).toBe('param=<script>');
    });

    it('handles null cvssScore on rehydrate', () => {
      const f = Finding.rehydrate({
        id: 'f-2', scanId: 's', targetId: 't', pluginId: 'p',
        title: 'T', description: 'D', type: FindingType.OTHER,
        severityLevel: SeverityLevel.LOW, cvssScore: null,
        evidence: null, recommendation: null, affectedUrl: null,
        createdAt: new Date(),
      });
      expect(f.cvssScore).toBeNull();
    });
  });
});
