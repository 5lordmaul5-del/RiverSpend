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
- RC-52 through RC-59: transaction, lifecycle state capacity, proxy trust-peer alignment, audit redaction/verification and delivery header hardening; see the progressive report for exact CI evidence and limitations.
- RC-60: audit append now rejects non-object/non-plain details before transaction to avoid persisting verifier-invalid records; CI verified at 194/194 (#617), 195/195 (#619), and report closeout 195/195 (#621).
- RC-61: restore target-parent traversal/create/cleanup uses directory descriptors and rejects symlinked parent components; CI verified at 195/195 Node tests and 3/3 restore race checks after recording and correcting descriptor-scope failures.
- Progressive technical evidence and blockers are recorded in `infra/rivercloud/AUDIT-HARDENING-2026-11-25.md`.
- These RCs are code/test increments, not a production readiness certification. OIDC-provider operation, real runner, external audit sink, staging and production readiness remain unverified.

- RC-62: RC-11 now fails closed on final state-directory symlinks/ownership/permissions and unsafe snapshot ownership/permissions; the API image initializes `/data` at mode 0700. CI verification pending.

- RC-62 initial CI failure #672 was caused by legacy test-fixture files written with 0644 mode; the privacy gate correctly rejected them. Fixtures are being corrected to 0600, with fresh CI evidence pending.
