import 'reflect-metadata';
import pino from 'pino';
import { config } from './shared/config/config';
import { createApp } from './app';
import { registerInfrastructure, getPool, closePool, closeRedis, runMigrations } from './infrastructure';

const logger = pino({ level: config.NODE_ENV === 'production' ? 'info' : 'debug' });

async function bootstrap(): Promise<void> {
  registerInfrastructure();

  const pool = getPool(config.DATABASE_URL);
  await runMigrations(pool, logger);

  const app = createApp();
  const server = app.listen(config.PORT, () => {
    logger.info({ port: config.PORT, env: config.NODE_ENV }, 'SentinelScan API started');
  });

  async function shutdown(): Promise<void> {
    logger.info('shutting down...');
    server.close();
    await Promise.all([closePool(), closeRedis()]);
    process.exit(0);
  }

  process.on('SIGTERM', () => { void shutdown(); });
  process.on('SIGINT',  () => { void shutdown(); });
}

void bootstrap();
