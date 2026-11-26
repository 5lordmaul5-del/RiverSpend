# RiverCloud roadmap

## RC-1 — Core scaffold
Docker Compose, proxy and bootstrap.

## RC-2 — Domain routing and HTTPS
Caddy routing to an example service, automatic TLS for configured domain.

## RC-3 — Secure deployment pipeline
Security requirements, policy validator and loopback-only local queue API prototype delivered. Queue persistence exists; runner, webhook, isolated builds, audit logs, health checks and rollback remain pending.

## RC-4 — RiverCloud Panel
Static panel scaffold delivered; authenticated control plane, API, deployment actions and real metrics remain unimplemented.

## RC-5 — Operations
Backup/restore testing, monitoring/alerts, firewall, update strategy, capacity planning.

## RC-6 — Migration readiness
Run RiverSpend in staging on RiverCloud, validate reliability, backups, secrets, performance and rollback. Only then consider production cutover.


## Current isolated hardening campaign — PR #75

- Branch: `feat/rivercloud-core-2026-11-25` (Draft; no merge or live deployment).
- RC-52: transaction snapshots are revalidated after mutation and before persistence.
- RC-53: RC-17 lifecycle extension collections fail closed on malformed data and enforce explicit capacity bounds.
- Progressive technical evidence and blockers are recorded in `infra/rivercloud/AUDIT-HARDENING-2026-11-25.md`.
- These RCs are code/test increments, not a production readiness certification. CI verification of the latest RC-52/53 commits is pending.
