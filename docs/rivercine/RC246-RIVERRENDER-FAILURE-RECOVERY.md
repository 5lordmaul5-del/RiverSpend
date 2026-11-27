# RC246 — RiverRender Failure Recovery

## Prototype
Browser-based policy simulator classifies failures and evaluates bounded retry eligibility. Exponential backoff is capped at 3600 seconds in the planning calculation. Retries are capped at five in the UI policy.

## Policy baseline
- Transient / worker-lost: candidate for bounded retry, subject to real reconciliation.
- Resource exhaustion: capacity review, no automatic retry by default.
- Invalid input: stop and require correction.
- Unknown: classify/review rather than blindly retry.
- Idempotency, attempt accounting, audit records and verified worker state required for future implementation.

## Recovery architecture
1. Record failure event and diagnostic category.
2. Reconcile worker lease and partial output state.
3. Determine retry eligibility and finite budget.
4. Schedule delay with bounded exponential backoff and jitter in production.
5. Ensure idempotent execution and output isolation.
6. Escalate exhausted jobs and preserve logs.

## Limitations
Simulation only: no actual retry, worker reconciliation, execution, persistent state, telemetry or rendering.
