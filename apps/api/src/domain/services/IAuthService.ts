import type { User } from '../entities/User';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService {
  login(email: string, password: string): Promise<TokenPair>;
  logout(refreshToken: string): Promise<void>;
  refresh(refreshToken: string): Promise<TokenPair>;
  validateAccessToken(token: string): Promise<User>;
}
