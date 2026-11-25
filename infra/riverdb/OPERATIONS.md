# RiverDB local operations

## Install and start
- From this folder: `npm install`
- Copy `.env.example` to `.env`, set unique strong credentials.
- Start: `docker compose up -d`
- Apply baseline: `./scripts/migrate.sh` with `RIVERDB_MIGRATION_URL` set.
- For app usage, use a restricted runtime account and `RIVERDB_URL`.

## Integration check
Set `RIVERDB_TEST_URL` to an isolated test DB after migrations and modules seed, then `npm test`. The opt-in test creates a task, reads it, claims it transactionally and completes it. Never point this test at production.

## Migration safety\n- Migration files are tracked by version and SHA-256 checksum. Re-running the runner skips a migration only when its checksum matches the recorded checksum.\n- A changed file already recorded in the ledger stops the runner; create a new migration instead of editing an applied migration.\n- A PostgreSQL advisory lock serializes migration execution.\n- Keep migration files immutable after application and test against an isolated database first.\n\n## Limitations\nBackup retention, remote storage, TLS, monitoring and production recovery procedures are not complete. Runtime permissions must be validated on a freshly provisioned database. Backup restore testing, retention, remote storage, TLS and monitoring are not complete.
