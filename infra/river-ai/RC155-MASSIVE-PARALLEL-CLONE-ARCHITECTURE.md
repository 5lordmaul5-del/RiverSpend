# RC-155 — RiverSSAI massive parallelism & AI replica architecture

## Goal
Design RiverSSAI for a logical catalog of up to 100,000 specialist agents and an independently testable RiverSSAI replica (clone/sandbox), without implying 100,000 simultaneous processes, model copies, or unlimited compute.

## Architecture layers
1. **Coordinator / Control plane**: accepts tasks, policy-checks, decomposes, assigns, tracks, cancels and reconciles work. It must not execute arbitrary task payloads.
2. **Virtual specialist catalog**: 100,000 logical identities/roles, lazy-loaded definitions and capability tags. Catalog entries are metadata, not processes.
3. **Dispatcher**: fair scheduling, bounded queue, task leases, retry budget, backpressure, priorities, aging and per-tenant quotas.
4. **Worker pool**: separately provisioned, sandboxed, replaceable workers; scale based on measured load and resource limits. No worker is assumed present until health/readiness is confirmed.
5. **Replica / RiverSSAI Clone**: isolated sandbox deployment using a versioned config, policy, model/provider adapter, prompt/system package and optional approved memory snapshot. Clone identity is explicit; credentials and mutable secrets are never copied. Clone may run in shadow/test mode and compare outputs, not write to production.
6. **RiverGuard**: deny-by-default permissions, capability-scoped access, human approval for external side effects, per-task budgets and cancellation.
7. **Observability**: queue depth, active leases, latency, failure rates, worker health, cost/resource estimates, audit event correlation and clone drift.
8. **Persistence**: durable task state, lease recovery, idempotency, dead-letter queue, versioned config and tested backup/restore.

## Scaling model
- 100,000 specialists are virtual registry entries and can be routed/filtered; only a bounded number of tasks are active.
- Autoscaling changes worker count, not the specialist catalog. A hard cap and budget guard always apply.
- Use batches, shared model serving, routing, caching and asynchronous task execution where suitable.
- Admission control rejects or defers work when queue, concurrency, rate, budget or resource limits are exceeded.
- Do not spawn a process/model instance for each specialist by default.

## Clone modes
- **Snapshot clone**: copy approved immutable config and policy package plus explicitly selected memory snapshot.
- **Shadow clone**: receives redacted mirrored tasks; no external side effects; output comparison only.
- **Canary clone**: small approved task share, isolated data and explicit rollback.
- **Independent clone**: separate runtime/state/credentials; no shared mutable state except through approved APIs.
- Never clone secrets, access tokens, production credentials or unreviewed private memory automatically.

## Suggested milestones
- M0: contracts, registry, scheduler invariants and metrics.
- M1: durable queue, lease/retry/idempotency and cancellation tests.
- M2: worker sandbox boundary, resource caps and executor mock.
- M3: clone packaging, snapshot verification, shadow comparison.
- M4: horizontal scale/load tests with synthetic workloads (no expensive model inference initially).
- M5: controlled model-provider integration and resource/budget gates.
- M6: recovery drill, rollback, operational runbook and security review.

## Acceptance gates
- Queue and active-worker limits enforced atomically.
- Task ownership/lease expiry prevents stale workers from committing.
- Retries are bounded; idempotency is persisted.
- Clone has independent identity, state and policy; no secret copying.
- All external side effects require capability and policy approval.
- Load tests document throughput, tail latency, memory and CPU for synthetic tasks; results are not extrapolated to model inference without separate tests.
- Cancellation and shutdown are verified.
- Fail-closed behavior on policy, persistence or worker-health failure.

## Explicit limits
This document is architecture/planning, not deployment. It does not provision hardware, launch 100,000 processes, download models, incur provider costs, create credentials, connect production data or deploy a clone. The 100,000 figure is a logical capacity target until measured and resourced.
