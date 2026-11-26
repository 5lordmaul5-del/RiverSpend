# RC-188 — Recovery and reconciliation journal

## Purpose
Provide a durable, local SQLite journal for operation state transitions and idempotent outcome recording, addressing a failure-recovery gap identified in the RC-186/187 prototype chain.

## State flow
- `reserved`: operation key and token ceiling recorded.
- `executed`: observed usage and a JSON outcome recorded.
- `reconciled`: journal acknowledges the recorded execution outcome.
- `failed`: operation failed before an execution outcome was recorded.

Repeated calls using the same operation ID and identical data are idempotent. Conflicting reservations or outcomes are rejected. `pending()` exposes reserved and executed operations for operator recovery.

## Critical boundaries
- This journal does **not** atomically transact with the worker task ledger, quota reservation DB, or external side effects.
- `reconciled` is a journal status, not proof of billing/payment settlement or quota commit.
- An operation marked `failed` is terminal in this prototype; retries should use a new operation ID or a separately designed retry protocol.
- SQLite is single-host/local persistence, not a distributed lock or multi-node coordination system.
- Result payloads are JSON-serialized; avoid secrets or sensitive data.
- The journal records caller-supplied usage, not independently verified measurements.

## Verification
Unit tests are included but have not been run in CI from this PR. Review and integration testing remain required.
