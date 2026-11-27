# RC-197 — Owner-scoped Execution Bridge

Connects RC-196's owner-scoped idempotency registry to a caller-injected executor.

- The owner argument must come from a verified identity boundary, not the client payload.
- Replays and payload conflicts are handled by RC-196 before execution.
- Execution errors are persisted as exception type only; raw exception messages are not returned or stored.
- Non-string executor results fail closed.
- If completion/failure persistence cannot be confirmed after an executor call, the bridge returns reconciliation_required and does not expose the result or re-run it.

Limitations: an external side effect is not atomic with SQLite; a process crash between effect and completion still requires reconciliation. This is a local prototype, not a transactional guarantee or production execution boundary.
