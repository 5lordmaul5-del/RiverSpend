# RC-159 — SQLite durable task ledger

Adds a standard-library SQLite task ledger with transactional enqueue, bounded queued-task admission, capability-filtered leasing, lease expiry/requeue, worker-owner completion, cancellation and status counters.

## Safety and limitations
- Ledger is metadata only; it does not execute task payloads.
- Worker ID is a logical owner, not authentication. Production must add authenticated workers and policy.
- Lease expiry may cause tasks to be retried; execution adapters must implement idempotency.
- SQLite local-file persistence is a prototype, not multi-host distributed storage.
- No secrets, external provider calls, deployment, media generation or automatic production changes.
- Tests are authored but not run in this environment.

Next: CI validation, authenticated worker boundary, durable idempotency and audit, policy controls, then separately approved execution integrations.
