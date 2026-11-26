# RC-149 — Implementation sequence for mock integration remediation

Status: planning/audit document. No code implementation, credentials, external calls, merge or deployment.

## Objective
Convert the static findings in RC-148 into small, testable gates before a real RiverSSAI/River API connection is considered.

## Gate 1 — Request envelope and model policy
- Define a strict versioned request envelope and bounded canonical representation.
- Resolve model aliases from server-owned configuration; reject unknown aliases.
- Establish limits for UTF-8 bytes, tokens, output bytes, deadlines and concurrency.
- Require trusted tenant and actor context from the identity-verification layer.

## Gate 2 — Idempotency semantics
- Namespace key by verified tenant, actor and route/version.
- Canonicalize only accepted data-only JSON; hash the canonical payload.
- Same key + same digest: return/in-progress status or safe completed replay.
- Same key + different digest: conflict.
- Store reservation, status, digest, and result reference atomically.
- Pending reservations must not be evicted due to ordinary capacity pressure.
- Define expiry and recovery of stuck pending records. Never automatically re-dispatch ambiguous provider outcomes.

## Gate 3 — Atomic quota reservations
- Reserve capacity atomically before dispatch, associated with idempotency record.
- Use bounded tenant and global capacity; fail closed if coordination/storage is unavailable.
- Settle actual usage or release only when outcome is known safe; ambiguous outcomes enter reconciliation.
- Define rate-limit and quota scopes, response codes, and retry-after behavior.
- Concurrent boundary tests must prove no oversubscription.

## Gate 4 — Provider adapter contract
- Adapter receives only validated task, server-selected model, bounded token/output settings, deadline and cancellation signal.
- No arbitrary URL, shell, filesystem, tools or endpoint selection.
- Adapter cancellation must be tested; timeout alone does not prove underlying work stopped.
- Bound output by bytes as well as characters; validate response shape and metadata against trusted config.

## Gate 5 — Audit and observability
- Audit every request path (allow, deny, validation, quota, timeout, provider error, cancellation and reconciliation).
- Record only allowlisted metadata; redact secrets, prompt and response by default.
- Durable audit failures have a documented policy and alert.
- Correlation IDs, metrics and readiness checks must not reveal secrets.

## Gate 6 — Recovery and acceptance
- Restart/recovery, concurrent replay, quota boundary, cross-tenant isolation, provider ambiguity, storage outage and audit outage tests.
- Fault-injection and load tests in isolated staging.
- Independent security review and operator runbook.
- Live credentials, external inference and production rollout require separate explicit approval.

## Execution order
1. Request/model validation and configuration.
2. Idempotency storage semantics.
3. Atomic quota reservation and settlement.
4. Adapter hardening and byte-level bounds.
5. Audit coverage.
6. Recovery/concurrency tests.
7. Independent review.

## Definition of done
A gate is complete only with implementation, test evidence, review and explicit approval. This plan is not evidence that any gate is implemented or operational.