# RC-182 — Bounded worker runner seam

Adds a single-task runner using an injected ledger, worker authorization callback,
policy callback, and executor. It fails closed when authorization or policy deny
execution and refuses to report success if ledger completion fails.

## Scope and limits
- Executes at most one leased task per call; no polling loop.
- Dependencies are injected; this module does not configure external services.
- Authorization is a callback contract, not a built-in identity system.
- The current RC-181 ledger does not record execution failures or release rejected
  leases; rejected/failed tasks remain leased until expiry/requeue.
- Executor results are returned to the caller but not persisted in the ledger.
- No merge, deployment, or production external effects.

## Tests
Authored tests cover successful completion, authorization denial, policy denial,
completion rejection and empty queue. They still need to be run in a CI/environment
where the RC-181 stacked branch dependencies are available.
