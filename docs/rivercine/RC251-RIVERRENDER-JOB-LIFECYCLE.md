# RC251 — RiverRender Job Lifecycle State Machine

## States
CREATED, VALIDATING, READY, QUEUED, ASSIGNED, RUNNING, VERIFYING, COMPLETED, FAILED, RETRY_PENDING, TERMINAL_FAILED, CANCELLED.

## Design rules
- Enforce explicit transition allowlists.
- Terminal states must not be reopened without a new job identity.
- Retry budget and idempotency gate RETRY_PENDING.
- Cancellation semantics must be reconciled with worker and output state.
- Persist transition events and timestamps in a future operational implementation.
- Prevent false completion: VERIFYING must precede COMPLETED.

## Prototype limitation
The browser simulator demonstrates a small subset of sequential and failure transitions. It is not a complete transition validator, backend service, persistence layer or executor.
