import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Redis } from 'ioredis';
import type { IAuthService, TokenPair } from '@domain/services/IAuthService';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { User } from '@domain/entities/User';
import { AuthenticationError } from '@domain/errors';
import { config } from '@shared/config/config';

const REFRESH_PREFIX = 'refresh:';
const BCRYPT_ROUNDS  = 12;

interface AccessPayload {
  sub: string;
  email: string;
  role: string;
}

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly redis: Redis,
  ) {}

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.userRepo.findByEmail(email);
    if (!user?.isActive) {
      throw new AuthenticationError('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AuthenticationError('Invalid email or password');
    }

    return this._issueTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.redis.del(`${REFRESH_PREFIX}${refreshToken}`);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const userId = await this.redis.get(`${REFRESH_PREFIX}${refreshToken}`);
    if (!userId) {
      throw new AuthenticationError('Refresh token is invalid or expired');
    }

    const user = await this.userRepo.findById(userId);
    if (!user?.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    await this.redis.del(`${REFRESH_PREFIX}${refreshToken}`);
    return this._issueTokens(user);
  }

  async validateAccessToken(token: string): Promise<User> {
    let payload: AccessPayload;
    try {
      payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as AccessPayload;
    } catch {
      throw new AuthenticationError('Access token is invalid or expired');
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user?.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    return user;
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  private async _issueTokens(user: User): Promise<TokenPair> {
    const payload: AccessPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign({ sub: user.id }, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
    });

    await this.redis.setex(
      `${REFRESH_PREFIX}${refreshToken}`,
      this._expiryToSeconds(config.JWT_REFRESH_EXPIRY),
      user.id,
    );

    return { accessToken, refreshToken };
  }

  private _expiryToSeconds(expiry: string): number {
    const m = /^(\d+)([smhd])$/.exec(expiry);
    if (!m) { return 7 * 86400; }
    const n = parseInt(m[1] ?? '7', 10);
    const u = m[2] ?? 'd';
    if (u === 's') { return n; }
    if (u === 'm') { return n * 60; }
    if (u === 'h') { return n * 3600; }
    return n * 86400;
  }
}
