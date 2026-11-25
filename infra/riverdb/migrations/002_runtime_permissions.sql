-- Run as database administrator. Replace the runtime role password before use.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='riverdb_runtime') THEN
    CREATE ROLE riverdb_runtime LOGIN;
  END IF;
END $$;
-- Set password separately using a secure secret channel, not committed SQL.
REVOKE ALL ON SCHEMA riverdb,audit FROM PUBLIC;
GRANT USAGE ON SCHEMA riverdb,audit TO riverdb_runtime;
GRANT SELECT,INSERT,UPDATE ON riverdb.tasks TO riverdb_runtime;
GRANT SELECT,INSERT ON riverdb.events TO riverdb_runtime;
GRANT INSERT ON audit.records TO riverdb_runtime;
GRANT USAGE,SELECT ON SEQUENCE audit.records_audit_id_seq TO riverdb_runtime;
GRANT SELECT ON riverdb.modules,riverdb.settings TO riverdb_runtime;
REVOKE UPDATE,DELETE ON audit.records FROM riverdb_runtime;
COMMIT;
