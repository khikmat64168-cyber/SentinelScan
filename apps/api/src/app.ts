import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import type { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './shared/config/config';
import { createApiRouter, errorHandler } from './presentation';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  app.use(rateLimit({
    windowMs:        config.RATE_LIMIT_WINDOW_MS,
    max:             config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders:   false,
    message:         { error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' } },
  }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'sentinelscan-api', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1', createApiRouter());

  app.use(errorHandler);

  return app;
}
