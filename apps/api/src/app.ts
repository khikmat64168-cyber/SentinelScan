import 'reflect-metadata';
import express from 'express';
import type { Application, Request, Response } from 'express';

export function createApp(): Application {
  const app = express();

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'sentinelscan-api',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
