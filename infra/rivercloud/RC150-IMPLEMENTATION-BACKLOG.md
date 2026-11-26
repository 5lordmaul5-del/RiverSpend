# RC-150 — RiverCloud / RiverSSAI implementation backlog

**Status:** implementation backlog, not production approval.  
**Scope:** turn RC-148 findings and RC-149 remediation sequence into small, independently reviewable code tasks.  
**Safety:** no credentials, provider calls, deployment, merges, or destructive operations.

## Sprint A — request contract and model policy
- [ ] Validate envelope fields and types; reject unknown fields.
- [ ] Enforce prompt, model identifier, token/output and payload byte limits.
- [ ] Server-owned allowlist of model/provider aliases; caller cannot override policy.
- [ ] Derive tenant and actor from verified auth context only.
- [ ] Add unit tests for malformed input, limits, unknown models, tenant boundary.
**Acceptance:** deterministic validation errors; no provider dispatch on invalid input; tests cover boundaries and denial paths.

## Sprint B — idempotency
- [ ] Canonicalize request representation and hash only approved fields.
- [ ] Namespace key by verified tenant, actor and route.
- [ ] Define replay (same key/same payload) and conflict (same key/different payload).
- [ ] Atomic reservation; never dispatch twice on concurrent identical requests.
- [ ] Pending/unknown outcome recovery must not blindly dispatch a second time.
- [ ] Persist/recover state or explicitly document a non-durable mode.
**Acceptance:** concurrent duplicate tests; restart/recovery tests; conflict and tenant-isolation tests.

## Sprint C — quota accounting
- [ ] Atomic reservation before provider dispatch.
- [ ] Settlement/release semantics for success, failure, timeout and unknown outcome.
- [ ] Concurrent quota tests; no overdraw under parallel calls.
- [ ] Reconciliation path for ambiguous provider outcomes.
**Acceptance:** race tests demonstrate quota integrity; fail closed when reservation cannot be confirmed.

## Sprint D — provider boundary
- [ ] Provider/model chosen only by server policy.
- [ ] Deadline propagated; cancellation behavior documented and tested.
- [ ] Bound response bytes and validate response schema.
- [ ] No arbitrary URLs, shell, filesystem, browser or tool execution in the facade.
- [ ] Map provider failures to safe generic errors.
**Acceptance:** contract tests for malformed/oversized responses, timeout, cancellation and provider failure.

## Sprint E — audit and observability
- [ ] Emit structured outcome events for allow/deny, replay, quota, timeout and provider error.
- [ ] Redact prompts, credentials, tokens and sensitive response data.
- [ ] Correlation identifier across request, reservation, provider and settlement.
- [ ] Define audit sink failure policy and measurable counters.
**Acceptance:** tests verify event coverage and redaction; audit failure behavior is explicit.

## Sprint F — independent gate
- [ ] CI tests green on candidate branch.
- [ ] Review storage, race, recovery and tenant isolation.
- [ ] Document limits, operator runbook and rollback.
- [ ] Separate approval for any live provider, credential or deployment wiring.

## Recommended execution order
1. Request validation and server model allowlist.
2. Atomic idempotency reservation and replay/conflict.
3. Atomic quota reserve/settle.
4. Provider adapter bounds and deadline.
5. Audit coverage and redaction.
6. Concurrency, recovery and fault-injection tests.
7. Independent review; only then consider live wiring.

This file is a task backlog. Items are not marked complete until code exists and tests/CI demonstrate the acceptance criteria.
