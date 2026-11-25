# RC-17 — same-file lifecycle/audit transaction

This increment adds a separate experimental lifecycle API that commits job state and its tamper-evident audit sequence in the same RC-11 atomic file transaction. It avoids the previous cross-file commit window for this API.

- lifecycle job records are stored under `lifecycleJobs`
- audit records are stored under `auditRecords` in the same state snapshot
- hash chain is sequence-checked and verified before every append
- invalid transitions and duplicate jobs fail without changing state
- audit details are bounded and key-redacted
- concurrent transition and create tests exercise the RC-11 lock/rename transaction

## Important boundary

The `lifecycle.mjs` facade now delegates job creation and transitions to RC-17, and its regression tests verify state/audit consistency and concurrent one-time transitions. The legacy separate-file lifecycle path is no longer used by this facade. Other modules and external consumers must still be audited before any production use. It does not authenticate actor labels or enforce OIDC/RBAC. The underlying RC-11 JSON store remains a local single-host file store, not a multi-node database. Crash durability and supported-platform lock behavior still require target-platform testing.
