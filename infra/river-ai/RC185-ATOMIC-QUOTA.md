# RC-185 — Atomic quota reservations
Adds a transactionally serialized reservation layer atop RC-184 SQLite usage events.
- BEGIN IMMEDIATE serializes quota checks and writes.
- Active reservations count against plan allowance with recorded usage.
- Commit records actual (or held) tokens and marks committed in one transaction.
- Release frees reserved capacity.
- Reservation IDs idempotent only when active and matching parameters.
- Trusted caller supplies identity, period, plan, and limit.
Prototype only: not integrated into auth/HTTP/worker, no billing. Caller-reported usage; SQLite is local and not distributed quota infrastructure. Tests authored, not run in CI.
