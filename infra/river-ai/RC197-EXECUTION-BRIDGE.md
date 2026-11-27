# RC-197 Transactional Execution Bridge

Orchestrates the RC-196 idempotency registry with a caller-injected executor. A key/payload decision is made first; only accepted requests reach the callback. Results and exceptions are recorded as completed or failed. Duplicate/conflicting keys do not execute again.

**Important limits:** the callback's external side effects are not transactionally coupled to SQLite. A process crash between side effect and recording completion may leave a processing record; manual or future reconciliation is required. This is a prototype, not a production transactional guarantee. Tests authored, not CI-verified.
