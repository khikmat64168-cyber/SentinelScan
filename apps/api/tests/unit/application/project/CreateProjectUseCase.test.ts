import { CreateProjectUseCase } from '@application/project/CreateProjectUseCase';
import type { IProjectRepository } from '@domain/repositories/IProjectRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { ValidationError } from '@domain/errors';

const mockProjectRepo = (): jest.Mocked<IProjectRepository> => ({
  findById:      jest.fn(),
  findByOwnerId: jest.fn(),
  save:          jest.fn(),
  delete:        jest.fn(),
});

const mockAuditRepo = (): jest.Mocked<IAuditLogRepository> => ({
  findById:     jest.fn(),
  findByFilter: jest.fn(),
  save:         jest.fn(),
});

describe('CreateProjectUseCase', () => {
  it('creates a project and returns projectId + name', async () => {
    const projectRepo = mockProjectRepo();
    const auditRepo   = mockAuditRepo();
    projectRepo.save.mockResolvedValue();
    auditRepo.save.mockResolvedValue();

    const useCase = new CreateProjectUseCase(projectRepo, auditRepo);
    const result  = await useCase.execute({ name: 'My Project', ownerId: 'user-1' });

    expect(result.name).toBe('My Project');
    expect(result.projectId).toBeTruthy();
    expect(projectRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws ValidationError for empty name', async () => {
    const useCase = new CreateProjectUseCase(mockProjectRepo(), mockAuditRepo());
    await expect(useCase.execute({ name: '', ownerId: 'user-1' })).rejects.toThrow(ValidationError);
  });
});
