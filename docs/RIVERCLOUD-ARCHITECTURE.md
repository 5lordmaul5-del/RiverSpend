# RiverCloud architecture baseline

## Design rules

1. PostgreSQL is the portable source of truth; application data is not tied to a single hosting provider.
2. Browser clients never receive database credentials, service-role keys, backup keys, or internal service tokens.
3. Every public API authenticates the caller, authorizes each object, validates input, rate-limits requests, and emits a redacted audit event.
4. Files live behind a storage adapter with private-by-default buckets and short-lived signed access. Database rows store object keys, not public file URLs.
5. Backups are encrypted before leaving the host, have integrity checks, and are restored regularly in an isolated environment.
6. RiverSSAI, RiverSpaceSignals, River Video, and RiverSpendShop use explicit service contracts; one application must not query another application's private tables directly.
7. Production cutover requires an export, row-count/checksum reconciliation, tested restore, rollback plan, and explicit approval.

## Deployment stages

- **Stage 0 — isolated local DB:** PostgreSQL container, loopback-only port, persistent volume, encrypted dump helper.
- **Stage 1 — RiverAuth and API:** identity provider, session validation, role-based authorization, API gateway, audit logging.
- **Stage 2 — RiverStorage:** select and test an S3-compatible or self-hosted object store; private buckets, lifecycle, malware scanning and signed URLs.
- **Stage 3 — resilience:** off-host encrypted copies in two independent locations, restore automation, health checks, alerting and documented RTO/RPO.
- **Stage 4 — app integration:** connect one application at a time through APIs; no direct browser-to-database access.
- **Stage 5 — migration:** only after parity and rollback tests; production data remains on the current provider until approval.

## Acceptance criteria before production

- Database and API are not publicly reachable except through the authenticated gateway.
- AuthZ tests prove users cannot read or mutate another user's records.
- Storage policies prove private objects cannot be fetched without authorization.
- Backups decrypt and restore successfully into a clean isolated database.
- A failed primary host can be recovered from an independent copy.
- Secrets are stored in a secret manager and rotated; none are committed to Git.
- Load, rate-limit, backup/restore, and incident-recovery tests are recorded.
