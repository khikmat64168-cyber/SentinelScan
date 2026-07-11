import { StartScanUseCase } from '@application/scan/StartScanUseCase';
import type { IScanRepository } from '@domain/repositories/IScanRepository';
import type { ITargetRepository } from '@domain/repositories/ITargetRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { Target } from '@domain/entities/Target';
import { NotFoundError, BusinessRuleError } from '@domain/errors';
import { ScanStatus } from '@domain/entities/Scan';

const mockScanRepo = (): jest.Mocked<IScanRepository> => ({
  findById:        jest.fn(),
  findByTargetId:  jest.fn(),
  findByProjectId: jest.fn(),
  save:            jest.fn(),
  delete:          jest.fn(),
});

const mockTargetRepo = (): jest.Mocked<ITargetRepository> => ({
  findById:        jest.fn(),
  findByProjectId: jest.fn(),
  save:            jest.fn(),
  delete:          jest.fn(),
});

const mockAuditRepo = (): jest.Mocked<IAuditLogRepository> => ({
  findById:     jest.fn(),
  findByFilter: jest.fn(),
  save:         jest.fn(),
});

const authorizedTarget = (): Target => {
  const t = Target.create({ url: 'https://example.com', projectId: 'proj-1' });
  t.authorize('user-1');
  return t;
};

describe('StartScanUseCase', () => {
  it('creates a PENDING scan for an authorized target', async () => {
    const scanRepo   = mockScanRepo();
    const targetRepo = mockTargetRepo();
    const auditRepo  = mockAuditRepo();

    targetRepo.findById.mockResolvedValue(authorizedTarget());
    scanRepo.save.mockResolvedValue();
    auditRepo.save.mockResolvedValue();

    const useCase = new StartScanUseCase(scanRepo, targetRepo, auditRepo);
    const scan    = await useCase.execute({
      targetId: 'target-1', projectId: 'proj-1',
      createdBy: 'user-1', pluginIds: ['headers'],
    });

    expect(scan.status).toBe(ScanStatus.PENDING);
    expect(scanRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundError when target does not exist', async () => {
    const targetRepo = mockTargetRepo();
    targetRepo.findById.mockResolvedValue(null);

    const useCase = new StartScanUseCase(mockScanRepo(), targetRepo, mockAuditRepo());
    await expect(
      useCase.execute({ targetId: 't', projectId: 'p', createdBy: 'u', pluginIds: [] }),
    ).rejects.toThrow(NotFoundError);
  });

  it('throws BusinessRuleError for unauthorized target', async () => {
    const targetRepo = mockTargetRepo();
    const unauth = Target.create({ url: 'https://example.com', projectId: 'proj-1' });
    targetRepo.findById.mockResolvedValue(unauth);

    const useCase = new StartScanUseCase(mockScanRepo(), targetRepo, mockAuditRepo());
    await expect(
      useCase.execute({ targetId: 't', projectId: 'p', createdBy: 'u', pluginIds: [] }),
    ).rejects.toThrow(BusinessRuleError);
  });
});
