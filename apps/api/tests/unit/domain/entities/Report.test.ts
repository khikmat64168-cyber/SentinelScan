import { Report, ReportFormat, ReportStatus } from '@domain/entities/Report';

const BASE: Parameters<typeof Report.create>[0] = {
  scanId:    'scan-1',
  projectId: 'proj-1',
  createdBy: 'user-1',
  format:    ReportFormat.PDF,
};

describe('Report', () => {
  describe('create()', () => {
    it('starts in GENERATING status', () => {
      expect(Report.create(BASE).status).toBe(ReportStatus.GENERATING);
    });

    it('starts with null storagePath and generatedAt', () => {
      const r = Report.create(BASE);
      expect(r.storagePath).toBeNull();
      expect(r.generatedAt).toBeNull();
    });

    it('stores format', () => {
      expect(Report.create(BASE).format).toBe(ReportFormat.PDF);
    });
  });

  describe('markReady()', () => {
    it('sets status to READY and records path', () => {
      const r = Report.create(BASE);
      r.markReady('/reports/scan-1.pdf');
      expect(r.status).toBe(ReportStatus.READY);
      expect(r.storagePath).toBe('/reports/scan-1.pdf');
      expect(r.generatedAt).toBeInstanceOf(Date);
    });
  });

  describe('markFailed()', () => {
    it('sets status to FAILED', () => {
      const r = Report.create(BASE);
      r.markFailed();
      expect(r.status).toBe(ReportStatus.FAILED);
      expect(r.generatedAt).toBeInstanceOf(Date);
    });
  });
});
