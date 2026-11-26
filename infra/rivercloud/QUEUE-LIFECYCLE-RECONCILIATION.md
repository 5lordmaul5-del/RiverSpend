# Queue / lifecycle reconciliation adapter

The module `queue-lifecycle-reconciliation.mjs` is an operator-invoked adapter to reconcile queue-only plans into the separately maintained atomic lifecycle ledger.

## Safety
- Does not run automatically, and is not wired into HTTP API routes or runner.
- Requires a valid lifecycle audit chain before attempting reconciliation.
- Processes only queue records explicitly marked `accepted_not_executed`.
- Uses deterministic plan digest-derived lifecycle IDs for retry idempotency.
- Lifecycle plan digest is not the same as the queue request digest; the adapter does not pretend the two digest domains are interchangeable.
- This remains source-only; no runtime validation or tests have been executed.

## Usage concept
Call `reconcileAcceptedPlans({ queueFile, lifecycleFile, actor })` only with separate, disposable or controlled state files. Review the returned examined/created/alreadyPresent/mismatches report. Do not use this as authorization for execution.
