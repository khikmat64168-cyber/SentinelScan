import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { AuditLog, AuditAction } from '@domain/entities/AuditLog';
import type { AuthService } from './AuthService';

export class LogoutUseCase {
  constructor(
    private readonly authService: AuthService,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(refreshToken: string, userId: string): Promise<void> {
    await this.authService.logout(refreshToken);
    await this.auditRepo.save(AuditLog.create({
      action:       AuditAction.USER_LOGOUT,
      actorId:      userId,
      resourceType: 'User',
      resourceId:   userId,
    }));
  }
}
