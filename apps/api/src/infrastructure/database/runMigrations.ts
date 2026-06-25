import type { Pool } from 'pg';
import type { Logger } from 'pino';
import { MIGRATIONS } from './schema';

export async function runMigrations(pool: Pool, logger: Logger): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id          SERIAL       PRIMARY KEY,
        name        VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    for (const migration of MIGRATIONS) {
      const result = await client.query<{ name: string }>(
        'SELECT name FROM _migrations WHERE name = $1',
        [migration.name],
      );

      if (result.rows[0]) { continue; }

      await client.query('BEGIN');
      try {
        await client.query(migration.up);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [migration.name]);
        await client.query('COMMIT');
        logger.info({ migration: migration.name }, 'migration applied');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
  } finally {
    client.release();
  }
}
