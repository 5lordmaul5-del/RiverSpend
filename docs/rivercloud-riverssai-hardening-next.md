# RiverCloud + RiverSSAI 10.0 — next hardening plan

This document is the implementation gate checklist for the active foundational work. It does not assert that tasks below are already implemented.

## Work sequence
1. **RiverCloud safety baseline:** validate local Compose secrets handling, API/database network isolation, DB role permissions, RLS coverage and lifecycle scripts. Do not expose DB/API ports publicly.
2. **Automated test gate:** syntax and unit tests; Compose config; Docker startup/readiness; RLS isolation with at least two distinct subjects; restart persistence; encrypted backup; restore to isolated database; checksum/integrity validation.
3. **Auth contract:** document token issuer, audience/expiry validation, subject mapping, outage behavior, rate limits and authorization; no production migration.
4. **API contract:** versioned routes, schema validation, size limits, idempotency where applicable, error handling, request IDs, redacted audit events and integration tests.
5. **RiverSSAI core:** agent registry schema; capability/tool allowlists; deterministic task planner; task queue contract; bounded worker execution; cancellation; retry/backoff; task depth and resource budgets.
6. **Simulated agent tests:** exercise large logical agent registries without spawning large numbers of processes. Benchmark registry/plan operations and prove worker concurrency limits.
7. **Integration adapter:** RiverSSAI task metadata through RiverCloud API only; offline/local mode remains available; explicit opt-in for media or binary uploads.
8. **Observability:** health/readiness, queue depth, task status, resource usage, redacted logs, backup age, replication status (when introduced), and clear error reporting.
9. **Security review:** least privilege, project/user authorization, input validation, sandbox boundaries, secrets hygiene, dependency checks, abuse/rate controls and data deletion/export plan.
10. **Release gate:** all relevant CI tests passing, manual security review, documented limitations and recovery drill. No merge/deployment or production cutover without explicit user approval.

## RiverSSAI logical scale

The goal of a very large registry (including the conceptual target of one billion logical agents) must be treated as a registry/catalogue capacity goal, not as a claim of simultaneous physical execution. Actual active workers are bounded by measured compute, budgets, concurrency, queue throughput and safety controls.

## Work reporting

Every update must distinguish: code changed; tests run and result; tests not run; blockers; next concrete step. Avoid unsupported claims of autonomous completion or unlimited infrastructure.
