# RiverCloud architectural baseline audit
Date: 2026-11-26
Branch: feat/rivercloud-core-2026-11-25
Scope: read-only inspection of README, engine, runner, queue, server and lifecycle modules. This is a focused baseline, not a full code audit.

## Confirmed design boundaries
- Engine currently creates/validates deployment plans only; no shell or deploy execution.
- Runner is preparation/verification only; executeRun explicitly disabled.
- Server binds loopback by default and rejects non-loopback host values.
- Server requires a token of at least 32 characters and uses constant-time comparison.
- Server applies request/header/socket timeouts and body size limit (8 KiB).
- Queue is transactional and idempotent; capacity caps exist.
- Lifecycle facade uses atomic lifecycle/audit storage.
- README says OIDC/RBAC is not integrated into API authentication and the prototype is not production-ready.

## Findings / follow-up gates
1. **Identity/RBAC integration gap (high priority):** queue endpoint authenticates a shared bearer token only; no per-user identity/authorization integration shown in the inspected server path. Keep loopback and prototype-only; before external exposure, wire identity and permission checks, actor attribution, and least privilege.
2. **Actor attribution mismatch:** queuePlan supports an actor context, but the server /deploy path calls queuePlan without one. Establish trusted actor derivation and persist it before any wider API exposure.
3. **Target-policy consistency:** engine allowlist currently restricts targets to staging; production is separately guarded. Confirm policy tests reflect this, and keep production blocked.
4. **Operational limits:** queue/state caps are present; review byte-level storage limits, disk pressure behavior, lock contention and corruption handling in the state implementation.
5. **Execution boundary:** no execution implementation is connected. Any future execution requires a separate isolated runtime, immutable input, approval, capability restrictions, timeout/resource limits, and adversarial tests.
6. **Observability/recovery:** review diagnostics and recovery across state store, lifecycle and backups; ensure sensitive data redaction and recovery rehearsal evidence.

## Suggested sequence
- Fix/verify API identity and actor-attribution contracts in test-only code.
- Review state-store transaction/lock/capacity/corruption behavior.
- Review lifecycle/approval binding and runner boundary for end-to-end invariants.
- Review backup/restore safety and rehearsal tests.
- Review network/proxy, container, filesystem and resource isolation.
- Run comprehensive isolated resilience matrix and collect CI evidence.

## Status
No live endpoint, host, deployment, credentials or production data were accessed. Findings are limited to inspected source files and should not be interpreted as an external penetration test.
