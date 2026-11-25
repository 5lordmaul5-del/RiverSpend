-- RiverDB baseline schema. Apply with a privileged migration account.
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS riverdb;
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE IF NOT EXISTS riverdb.schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now(),
  checksum text NOT NULL
);

CREATE TABLE IF NOT EXISTS riverdb.modules (
  module_id text PRIMARY KEY,
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled','maintenance')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS riverdb.tasks (
  task_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text NOT NULL REFERENCES riverdb.modules(module_id),
  task_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','review','running','succeeded','failed','cancelled')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text UNIQUE,
  version bigint NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS tasks_status_created_idx ON riverdb.tasks(status,created_at);

CREATE TABLE IF NOT EXISTS riverdb.events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text NOT NULL REFERENCES riverdb.modules(module_id),
  event_type text NOT NULL,
  entity_type text,
  entity_id text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  correlation_id uuid
);
CREATE INDEX IF NOT EXISTS events_module_time_idx ON riverdb.events(module_id,occurred_at);

CREATE TABLE IF NOT EXISTS audit.records (
  audit_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor text NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  correlation_id uuid
);

-- Prevent modifications/deletions of audit rows at database level.
CREATE OR REPLACE FUNCTION audit.reject_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit records are append-only';
END;
$$;
DROP TRIGGER IF EXISTS audit_immutable_trigger ON audit.records;
CREATE TRIGGER audit_immutable_trigger
BEFORE UPDATE OR DELETE ON audit.records
FOR EACH ROW EXECUTE FUNCTION audit.reject_mutation();

CREATE TABLE IF NOT EXISTS riverdb.settings (
  setting_key text PRIMARY KEY,
  setting_value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO riverdb.modules(module_id,display_name) VALUES
 ('fulcron','Fulcron'),('powertron','PowerTron'),('rivercloud','RiverCloud')
ON CONFLICT(module_id) DO NOTHING;

INSERT INTO riverdb.schema_migrations(version,checksum)
VALUES ('001_core','riverdb-core-baseline-v1')
ON CONFLICT(version) DO NOTHING;

COMMIT;
