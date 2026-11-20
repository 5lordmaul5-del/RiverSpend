# RiverCloud architecture baseline

## Design rules

1. PostgreSQL is the portable source of truth; application data is not tied to a single hosting provider.
2. Browser clients never receive database credentials, service-role keys, backup keys, or internal service tokens.
3. Every public API authenticates the caller, authorizes each object, validates input, rate-limits requests, and emits a redacted audit event.
4. Files live behind a storage adapter with private-by-default buckets and short-lived signed access. Database rows store object keys, not public file URLs.
5. Backups are encrypted before leaving the host, have integrity checks, and are restored regularly in an isolated environment.
6. RiverSSAI, RiverSpaceSignals, River Video, and RiverSpendShop use explicit service contracts; one application must not query another application's private tables directly.
7. Production cutover requires an export, row-count/checksum reconciliation, tested restore, rollback plan, and explicit approval.

## Current local topology

```text
                 Existing Supabase Auth
                    (identity issuer)
                           |
                     outbound HTTPS
                           |
                 +-------------------+
                 | RiverCloud API    |
                 | token validation |
                 | user-scoped routes|
                 +---------+---------+
                           |
                  private Docker network
                           |
                 +---------v---------+
                 | PostgreSQL 17     |
                 | rivercloud schema |
                 | forced RLS        |
                 +-------------------+
```

- PostgreSQL is bound to host loopback only (`127.0.0.1:55432`).
- The API has no published host port. It is attached to a private database network and a separate outbound network for identity-token verification.
- The database is not attached to the outbound network.
- The API connects using a dedicated non-superuser role. The private `rivercloud.user_profiles` table uses forced RLS and transaction-local subject context.
- The initial API routes are limited to health, read-own-profile and update-own-display-name. No admin, payment, order or cross-user routes exist.

## RiverAuth transition

The current RiverAuth implementation is an identity adapter, not an independent issuer. It validates existing Supabase access tokens using the Auth server's user-verification endpoint and maps the verified immutable UUID to a RiverCloud subject. This preserves existing RiverSpend sessions and avoids duplicate accounts during the first stage.

A first-party RiverAuth issuer is a later security project. It requires OIDC/OAuth compatibility, signing-key rotation and JWKS, MFA, password recovery, email verification, session inventory/revocation, rate limiting, abuse detection, audit trails, account linking, data export/deletion and a migration/rollback plan. Do not mint a parallel identity or migrate the live users before these controls are reviewed and tested.

## Deployment stages

- **Stage 0 — isolated local DB:** PostgreSQL container, loopback-only port, persistent volume, encrypted dump helper, disposable restore drill and automated start/stop/backup/restore CI.
- **Stage 1 — RiverAuth adapter and private API:** existing identity issuer validation, per-request authorization, dedicated DB role, forced RLS, input limits and no public API listener.
- **Stage 2 — RiverStorage:** select and test an S3-compatible or self-hosted object store; private buckets, lifecycle, malware scanning and signed URLs.
- **Stage 3 — resilience:** off-host encrypted copies in two independent locations, restore automation, health checks, alerting and documented RTO/RPO.
- **Stage 4 — app integration:** connect one application at a time through APIs; no direct browser-to-database access.
- **Stage 5 — migration:** only after parity and rollback tests; production data remains on the current provider until approval.

## Multi-machine production target

```text
                  DNS / health-aware ingress
                             |
                   +---------+---------+
                   |                   |
             API node A           API node B
                   |                   |
                   +---------+---------+
                             |
                private database network
                             |
             PostgreSQL primary (node A)
                             |
                  streaming replication
                             |
             PostgreSQL standby (node B)

       Encrypted backups -> independent node/storage C
       Monitoring + alerting -> independent failure domain
```

- Place primary and standby in separate power, network and preferably provider/physical failure domains.
- Use PostgreSQL streaming replication with measured replication lag and a documented promotion process.
- Use a third witness/quorum mechanism and fencing to prevent split-brain; do not rely on two nodes alone for unattended automatic failover.
- Keep immutable encrypted backups separate from the replica, with separate credentials and retention.
- Monitor replication lag, backup age, disk health, API health and certificate expiry.
- Test node loss, promotion, failback and restore regularly. Define and measure RPO/RTO before production.
- A single VPS or a pair of servers in one rack is not a complete disaster-recovery design.

## Acceptance criteria before production

- Database and API are not publicly reachable except through authenticated TLS ingress.
- AuthZ tests prove users cannot read or mutate another user's records, including through RLS bypass attempts.
- API credentials are least-privilege; service secrets are rotated and never committed.
- Storage policies prove private objects cannot be fetched without authorization.
- Backups pass SHA-256 verification and decrypt/restore successfully into a clean disposable database; the drill records the restored public-table count.
- A failed primary host can be recovered from an independent copy, and promotion is protected against split-brain.
- Load, rate-limit, backup/restore, failover and incident-recovery tests are recorded.
- Production migration requires a rollback rehearsal and explicit approval.
