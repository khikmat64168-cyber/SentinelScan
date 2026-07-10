import { CreateTargetUseCase } from '@application/target/CreateTargetUseCase';
import type { ITargetRepository } from '@domain/repositories/ITargetRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { TargetNotAuthorizedError } from '@domain/errors/TargetNotAuthorizedError';

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

describe('CreateTargetUseCase', () => {
  it('creates a target for a valid public URL', async () => {
    const targetRepo = mockTargetRepo();
    const auditRepo  = mockAuditRepo();
    targetRepo.save.mockResolvedValue();
    auditRepo.save.mockResolvedValue();

    const useCase = new CreateTargetUseCase(targetRepo, auditRepo);
    const result  = await useCase.execute({ url: 'https://example.com', projectId: 'proj-1', createdBy: 'user-1' });

    expect(result.targetId).toBeTruthy();
    expect(targetRepo.save).toHaveBeenCalledTimes(1);
  });

  it('rejects private IP addresses (SSRF guard)', async () => {
    const useCase = new CreateTargetUseCase(mockTargetRepo(), mockAuditRepo());
    await expect(
      useCase.execute({ url: 'http://192.168.1.1', projectId: 'proj-1', createdBy: 'user-1' }),
    ).rejects.toThrow(TargetNotAuthorizedError);
  });
});
