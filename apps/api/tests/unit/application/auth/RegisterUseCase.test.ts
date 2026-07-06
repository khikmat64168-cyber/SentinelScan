import { RegisterUseCase } from '@application/auth/RegisterUseCase';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { ConflictError } from '@domain/errors';
import { User, UserRole } from '@domain/entities/User';

const mockUserRepo = (): jest.Mocked<IUserRepository> => ({
  findById:    jest.fn(),
  findByEmail: jest.fn(),
  save:        jest.fn(),
  delete:      jest.fn(),
});

const mockAuditRepo = (): jest.Mocked<IAuditLogRepository> => ({
  findById:     jest.fn(),
  findByFilter: jest.fn(),
  save:         jest.fn(),
});

describe('RegisterUseCase', () => {
  it('creates a user and returns userId + email', async () => {
    const userRepo  = mockUserRepo();
    const auditRepo = mockAuditRepo();
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.save.mockResolvedValue();
    auditRepo.save.mockResolvedValue();

    const useCase = new RegisterUseCase(userRepo, auditRepo);
    const result  = await useCase.execute({ email: 'test@example.com', password: 'Password1!' });

    expect(result.email).toBe('test@example.com');
    expect(result.userId).toBeTruthy();
    expect(userRepo.save).toHaveBeenCalledTimes(1);
    expect(auditRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictError when email already exists', async () => {
    const userRepo  = mockUserRepo();
    const auditRepo = mockAuditRepo();
    const existing  = User.create({ email: 'test@example.com', passwordHash: 'hash' });
    userRepo.findByEmail.mockResolvedValue(existing);

    const useCase = new RegisterUseCase(userRepo, auditRepo);
    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' }))
      .rejects.toThrow(ConflictError);
  });

  it('assigns default ANALYST role', async () => {
    const userRepo  = mockUserRepo();
    const auditRepo = mockAuditRepo();
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.save.mockResolvedValue();
    auditRepo.save.mockResolvedValue();

    const useCase = new RegisterUseCase(userRepo, auditRepo);
    await useCase.execute({ email: 'a@b.com', password: 'pass' });

    const savedUser = userRepo.save.mock.calls[0]?.[0] as User;
    expect(savedUser.role).toBe(UserRole.ANALYST);
  });
});
