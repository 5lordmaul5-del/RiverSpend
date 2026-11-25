# RiverDB — RiverSpend data foundation

RiverDB is the relational data foundation for RiverSpend. This branch establishes a PostgreSQL-based core, repeatable SQL migrations, least-privilege application access, append-only audit records, health checks, and backup/restore procedures.

## Scope
- PostgreSQL 17 container configuration for isolated development/staging.
- SQL schema/migration baseline for identity references, projects/modules, tasks, events, audit records, and idempotency.
- Database roles: owner/migration role and restricted runtime role.
- Audit entries are append-only by permissions and trigger.
- Backup/restore scripts using pg_dump/pg_restore with explicit confirmation for restore.
- No production deployment, no secrets, and no data migration in this PR.

## Start in an isolated environment
1. Copy `.env.example` to `.env` and replace passwords locally.
2. Run `docker compose -f infra/riverdb/docker-compose.yml up -d`.
3. Apply migration: `psql "$RIVERDB_MIGRATION_URL" -v ON_ERROR_STOP=1 -f infra/riverdb/migrations/001_core.sql`.
4. Run the checks in `infra/riverdb/scripts/check.sh`.

Never expose PostgreSQL publicly. Restrict host port to loopback. Do not use example passwords.

## Production requirements still outstanding
External identity and MFA; secret management; migration runner with locking and version ledger; TLS configuration; tested backup retention and off-site storage; restore drills; monitoring/alerting; connection pooling; HA/replication strategy; privacy/retention policies; threat model; load tests; and a staged deployment review. This is a foundation, not production-ready database service.
