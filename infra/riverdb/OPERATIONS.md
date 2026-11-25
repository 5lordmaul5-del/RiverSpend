# RiverDB local operations

## Install and start
- From this folder: `npm install`
- Copy `.env.example` to `.env`, set unique strong credentials.
- Start: `docker compose up -d`
- Apply baseline: `./scripts/migrate.sh` with `RIVERDB_MIGRATION_URL` set.
- For app usage, use a restricted runtime account and `RIVERDB_URL`.

## Integration check
Set `RIVERDB_TEST_URL` to an isolated test DB after migrations and modules seed, then `npm test`. The opt-in test creates a task, reads it, claims it transactionally and completes it. Never point this test at production.

## Limitations
The migration runner is not yet a versioned/locked migration framework; baseline scripts are idempotent but checksum enforcement and concurrent migration locks need further implementation. Runtime permissions must be validated on a freshly provisioned database. Backup restore testing, retention, remote storage, TLS and monitoring are not complete.
