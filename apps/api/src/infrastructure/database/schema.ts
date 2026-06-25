export interface Migration {
  name: string;
  up: string;
}

export const MIGRATIONS: Migration[] = [
  {
    name: '001_create_extensions',
    up: `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`,
  },
  {
    name: '002_create_users',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id            UUID         PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT         NOT NULL,
        role          VARCHAR(20)  NOT NULL DEFAULT 'analyst',
        is_active     BOOLEAN      NOT NULL DEFAULT true,
        created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
    `,
  },
  {
    name: '003_create_projects',
    up: `
      CREATE TABLE IF NOT EXISTS projects (
        id          UUID         PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        description TEXT         NOT NULL DEFAULT '',
        owner_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_archived BOOLEAN      NOT NULL DEFAULT false,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects (owner_id);
    `,
  },
  {
    name: '004_create_targets',
    up: `
      CREATE TABLE IF NOT EXISTS targets (
        id            UUID         PRIMARY KEY,
        url           TEXT         NOT NULL,
        project_id    UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        is_authorized BOOLEAN      NOT NULL DEFAULT false,
        authorized_at TIMESTAMPTZ,
        authorized_by UUID         REFERENCES users(id),
        created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_targets_project_id ON targets (project_id);
    `,
  },
  {
    name: '005_create_scans',
    up: `
      CREATE TABLE IF NOT EXISTS scans (
        id            UUID        PRIMARY KEY,
        target_id     UUID        NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
        project_id    UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        created_by    UUID        NOT NULL REFERENCES users(id),
        plugin_ids    TEXT[]      NOT NULL DEFAULT '{}',
        status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        started_at    TIMESTAMPTZ,
        completed_at  TIMESTAMPTZ,
        error_message TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_scans_target_id  ON scans (target_id);
      CREATE INDEX IF NOT EXISTS idx_scans_project_id ON scans (project_id);
      CREATE INDEX IF NOT EXISTS idx_scans_status     ON scans (status);
    `,
  },
  {
    name: '006_create_findings',
    up: `
      CREATE TABLE IF NOT EXISTS findings (
        id             UUID          PRIMARY KEY,
        scan_id        UUID          NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
        target_id      UUID          NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
        plugin_id      VARCHAR(100)  NOT NULL,
        title          TEXT          NOT NULL,
        description    TEXT          NOT NULL,
        type           VARCHAR(50)   NOT NULL,
        severity_level VARCHAR(20)   NOT NULL,
        cvss_score     NUMERIC(3,1),
        evidence       TEXT,
        recommendation TEXT,
        affected_url   TEXT,
        created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_findings_scan_id        ON findings (scan_id);
      CREATE INDEX IF NOT EXISTS idx_findings_severity_level ON findings (severity_level);
    `,
  },
  {
    name: '007_create_reports',
    up: `
      CREATE TABLE IF NOT EXISTS reports (
        id           UUID        PRIMARY KEY,
        scan_id      UUID        NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
        project_id   UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        created_by   UUID        NOT NULL REFERENCES users(id),
        format       VARCHAR(10) NOT NULL,
        status       VARCHAR(20) NOT NULL DEFAULT 'GENERATING',
        storage_path TEXT,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        generated_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_reports_scan_id ON reports (scan_id);
    `,
  },
  {
    name: '008_create_audit_logs',
    up: `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id            UUID        PRIMARY KEY,
        action        VARCHAR(50) NOT NULL,
        actor_id      UUID        NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id   UUID        NOT NULL,
        metadata      JSONB       NOT NULL DEFAULT '{}',
        ip_address    INET,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id     ON audit_logs (actor_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_resource     ON audit_logs (resource_type, resource_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at   ON audit_logs (created_at DESC);
    `,
  },
];
