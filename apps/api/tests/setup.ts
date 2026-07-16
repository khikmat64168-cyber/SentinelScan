// Sets minimum required env vars so the Zod config module
// does not call process.exit(1) when imported during unit tests.
process.env['DATABASE_URL']       = 'postgresql://test:test@localhost:5432/test';
process.env['REDIS_URL']          = 'redis://localhost:6379';
process.env['JWT_ACCESS_SECRET']  = 'test-access-secret-minimum-32-characters!!';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-minimum-32-characters!';
process.env['CORS_ORIGIN']        = 'http://localhost:5173';
