-- SentinelScan — PostgreSQL initialisation
-- Runs once on first container start.
-- Application migrations are applied by the API at startup.

-- Required for gen_random_uuid() used in migration files
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Read-only role for report/analytics queries (principle of least privilege).
-- The application's main user has full DML rights; this role is read-only.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sentinelscan_readonly'
    ) THEN
        CREATE ROLE sentinelscan_readonly NOLOGIN;
        GRANT CONNECT ON DATABASE sentinelscan TO sentinelscan_readonly;
    END IF;
END
$$;
