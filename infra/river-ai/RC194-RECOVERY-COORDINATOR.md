# RC-194 — Recovery Coordinator Prototype

SQLite-based retry coordinator with exponential backoff, optional jitter, due-job selection, claim transition, success completion and dead-letter state once attempts reach the configured maximum.

## Safety limitations
This is a local prototype: claiming is a state transition but does not include a lease/heartbeat or fencing integration. Crash while running can strand a job. Payload is opaque text; no automatic replay or side-effect idempotency. It does not integrate with prior ledger/supervisor modules, run external work, or coordinate across hosts. Tests authored but not CI-verified.
