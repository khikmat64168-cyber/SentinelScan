import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { User } from '@domain/entities/User';
import type { UserRole } from '@domain/entities/User';
import { AuditLog, AuditAction } from '@domain/entities/AuditLog';
import { ConflictError } from '@domain/errors';
import { AuthService } from './AuthService';

export interface RegisterCommand {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterResult {
  userId: string;
  email: string;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(cmd: RegisterCommand): Promise<RegisterResult> {
    const existing = await this.userRepo.findByEmail(cmd.email);
    if (existing) {
      throw new ConflictError(`User with email "${cmd.email}" already exists`);
    }

    const passwordHash = await AuthService.hashPassword(cmd.password);
    const user = User.create({ email: cmd.email, passwordHash, role: cmd.role });

    await this.userRepo.save(user);
    await this.auditRepo.save(AuditLog.create({
      action:       AuditAction.USER_CREATED,
      actorId:      user.id,
      resourceType: 'User',
      resourceId:   user.id,
    }));

    return { userId: user.id, email: user.email };
  }
}
