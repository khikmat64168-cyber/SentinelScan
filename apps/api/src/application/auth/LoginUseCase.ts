import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import type { TokenPair } from '@domain/services/IAuthService';
import { AuditLog, AuditAction } from '@domain/entities/AuditLog';
import type { AuthService } from './AuthService';

export interface LoginCommand {
  email: string;
  password: string;
  ipAddress?: string;
}

export class LoginUseCase {
  constructor(
    private readonly authService: AuthService,
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(cmd: LoginCommand): Promise<TokenPair> {
    const tokens = await this.authService.login(cmd.email, cmd.password);

    const user = await this.authService.validateAccessToken(tokens.accessToken);
    await this.auditRepo.save(AuditLog.create({
      action:       AuditAction.USER_LOGIN,
      actorId:      user.id,
      resourceType: 'User',
      resourceId:   user.id,
      ipAddress:    cmd.ipAddress,
    }));

    return tokens;
  }
}
