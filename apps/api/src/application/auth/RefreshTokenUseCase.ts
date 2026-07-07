import type { TokenPair } from '@domain/services/IAuthService';
import type { AuthService } from './AuthService';

export class RefreshTokenUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    return this.authService.refresh(refreshToken);
  }
}
