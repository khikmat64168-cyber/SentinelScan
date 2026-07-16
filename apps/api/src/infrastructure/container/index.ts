import { container } from 'tsyringe';
import { config } from '@shared/config/config';
import { getPool } from '../database/pool';
import { getRedis } from '../cache/RedisClient';
import { PgUserRepository } from '../repositories/PgUserRepository';
import { PgProjectRepository } from '../repositories/PgProjectRepository';
import { PgTargetRepository } from '../repositories/PgTargetRepository';
import { PgScanRepository } from '../repositories/PgScanRepository';
import { PgFindingRepository } from '../repositories/PgFindingRepository';
import { PgReportRepository } from '../repositories/PgReportRepository';
import { PgAuditLogRepository } from '../repositories/PgAuditLogRepository';
import { AuthService } from '@application/auth/AuthService';
import { TOKENS } from './tokens';

export function registerInfrastructure(): void {
  const pool  = getPool(config.DATABASE_URL);
  const redis = getRedis(config.REDIS_URL);

  container.registerInstance(TOKENS.Pool,  pool);
  container.registerInstance(TOKENS.Redis, redis);

  container.registerInstance(TOKENS.UserRepository,     new PgUserRepository(pool));
  container.registerInstance(TOKENS.ProjectRepository,  new PgProjectRepository(pool));
  container.registerInstance(TOKENS.TargetRepository,   new PgTargetRepository(pool));
  container.registerInstance(TOKENS.ScanRepository,     new PgScanRepository(pool));
  container.registerInstance(TOKENS.FindingRepository,  new PgFindingRepository(pool));
  container.registerInstance(TOKENS.ReportRepository,   new PgReportRepository(pool));
  container.registerInstance(TOKENS.AuditLogRepository, new PgAuditLogRepository(pool));

  const userRepo = new PgUserRepository(pool);
  container.registerInstance(TOKENS.AuthService, new AuthService(userRepo, redis));
}

export { container, TOKENS };
