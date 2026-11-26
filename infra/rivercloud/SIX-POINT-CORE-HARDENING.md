# RiverCloud — Six-Point Core Hardening Roadmap
Branch: feat/rivercloud-core-2026-11-25
Status: working plan; branch-only, isolated, no production deployment.

## Baseline
The branch already contains a prototype engine, queue, runner, lifecycle/state modules, API proxy, OIDC/identity and permission-related work, backup/restore scripts, staging/readiness checks, audit ledger and RC tests. RC-100's Push and Pull Request CI were confirmed green. This does not establish production readiness.

## 1 — Architecture and module audit
Inventory module responsibilities, dependency graph, entry points, trust boundaries, failure modes, and test coverage. Identify overlapping responsibilities and undocumented contracts. Keep the inventory updated as modules change.

## 2 — Execution engine and process lifecycle
Review runner/worker separation, lifecycle transitions, process isolation, lock ownership, atomicity, cancellation, timeouts, crash recovery and idempotency. Require safe defaults and test failure paths before adding real execution capability.

## 3 — Storage, filesystem and persistence
Review queue/state/audit storage semantics, atomic writes, permissions, capacity limits, corruption handling, backup/restore integrity, path traversal and race protections. Test restore in isolated temporary targets only.

## 4 — Network, API, identity and permissions
Review API boundary, proxy trust, OIDC identity, authorization catalog, actor attribution, input validation, request size/timeouts, rate limits, secrets handling, TLS and replay defenses. Deny by default.

## 5 — Logs, diagnostics and recovery
Review observability, redaction, structured diagnostics, health/readiness separation, failure signals, restart/recovery behavior, audit continuity and incident-safe modes. Never expose credentials or sensitive payloads.

## 6 — Resilience and isolated rehearsal
Create a repeatable test matrix for malformed requests, permission denial, storage faults, crashes, timeouts, resource limits, interrupted operations and backup/restore. Use local/test fixtures only; no live services, real credentials, production migration or spending.

## Work rules
- Changes only on this branch and in isolated test scope.
- No merge, production deployment, live service activation, credentials, or spending.
- Each implementation slice gets focused tests and CI verification.
- Report verified results separately from planned or unverified work.
- Treat readiness as evidence-based; passing tests alone is not a production-readiness claim.
