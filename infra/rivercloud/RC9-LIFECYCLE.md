# RC-9 lifecycle prototype

States: pending -> approved/rejected/cancelled; approved -> prepared; prepared -> running/failed/cancelled; running -> completed/failed; failed -> prepared (retry); terminal states reject further transitions.

Lifecycle job mutations now serialize through the RC-11 state transaction, and the local hash-chain ledger serializes concurrent append operations through its own transaction file. The ledger is redacted at append time and verified before a new record is appended.

**Persistence caveat:** lifecycle state and its audit ledger are separate files. Each file is serialized independently, but a crash between the two file commits can leave a mismatch; this is not a cross-file atomic transaction. The audit file now uses the RC-11 state envelope rather than the former raw-array format. Prototype files should be migrated manually only after a verified backup; no deployed data is known to exist.

Actor labels are not authenticated. No OIDC integration, worker, build or deployment is connected. Do not expose or use this prototype in production.
