import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Database — validated as a non-empty string; driver validates the format
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // JWT — minimum 32 chars enforced to prevent weak secrets
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  // Errors logged to stderr — do not leak to HTTP responses
  process.stderr.write(
    `\n[sentinelscan] Invalid environment configuration:\n${JSON.stringify(
      result.error.format(),
      null,
      2,
    )}\n\n`,
  );
  process.exit(1);
}

// Frozen to prevent accidental mutation at runtime
export const config = Object.freeze(result.data);

export type Config = typeof config;
