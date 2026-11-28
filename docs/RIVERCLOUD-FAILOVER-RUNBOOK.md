# RiverCloud multi-machine recovery runbook (design draft)

This document is a preparation checklist, not an executable production failover procedure. Do not run promotion commands against production until node addresses, replication state, fencing and recovery tests are reviewed.

## Target roles

| Role | Responsibility | Failure domain |
|---|---|---|
| DB-A | PostgreSQL primary | Provider / site A |
| DB-B | PostgreSQL synchronous or asynchronous standby | Provider / site B |
| WITNESS | Third DCS/quorum member; no customer database | Independent site C |
| API-A / API-B | Stateless RiverCloud API instances | Separate from each other |
| BACKUP-C | Encrypted immutable backups and restore catalog | Independent storage credentials and location |

Use Patroni for PostgreSQL role management with a three-member DCS quorum (for example, etcd). The witness is not a database replica and does not contain a full customer data copy. API ingress must be health-aware and must not route traffic to an unhealthy node.

## Before enabling replication

- Select the two database providers/sites and a third independent witness location.
- Define private network paths, firewall allowlists, TLS certificates and private DNS.
- Decide synchronous versus asynchronous replication based on measured latency and the agreed recovery-point objective (RPO).
- Set explicit RPO and recovery-time objective (RTO); do not assume zero data loss.
- Configure PostgreSQL replication credentials with least privilege and TLS.
- Configure DCS quorum, leader leases, fencing and a tested manual promotion path.
- Configure encrypted backups to a third location, separate credentials, immutable retention and periodic restore checks.
- Monitor WAL generation, replication lag, disk capacity, DCS quorum, backup age, TLS expiry and API health.

## Planned failover procedure

1. Declare an incident and stop any automated/manual promotion attempts from other operators.
2. Determine whether DB-A is actually unavailable or merely partitioned from the monitoring network.
3. Fence DB-A (power/network/storage isolation) before promoting DB-B. Never promote while the old primary may still accept writes.
4. Verify DB-B's replay LSN and quantify potential data loss against the agreed RPO.
5. Confirm DCS quorum and leader ownership; promote only through the approved Patroni procedure.
6. Route API traffic to the healthy primary and run read/write smoke tests using a non-production probe account.
7. Record the incident timeline, final LSNs, data-loss estimate and user impact.
8. Keep the old primary fenced. Rebuild it as a standby from the new primary; never reintroduce it as a writable primary without a controlled rejoin.
9. Verify a fresh independent backup and a restore drill after recovery.

## Restore when replication is unavailable

1. Select the newest verified encrypted backup from BACKUP-C.
2. Verify its SHA-256 checksum and age decryption identity using a controlled recovery host.
3. Restore into a clean isolated PostgreSQL instance.
4. Validate schema migrations, table counts, application invariants and checksums.
5. Promote the restored instance only after incident commander approval and explicit reconciliation of data loss.
6. Reconnect applications through the private API ingress; never expose PostgreSQL directly.

## Mandatory exercises

- Quarterly isolated restore from BACKUP-C.
- Scheduled failover rehearsal with DB-A fenced.
- DCS quorum-loss rehearsal that proves no split-brain promotion occurs.
- API node loss and ingress failover.
- Credential rotation and backup-key recovery exercise.

Record measured RPO/RTO and remediation actions after every exercise. Backups, replicas and high availability solve different failure modes; maintain all three.
