# RC-9 lifecycle prototype — migrated to RC-17 atomic storage

States: pending -> approved/rejected/cancelled; approved -> prepared; prepared -> running/failed/cancelled; running -> completed/failed; failed -> prepared (retry); terminal states reject further transitions.

The `lifecycle.mjs` facade now delegates to RC-17. Lifecycle job and hash-chained audit records commit together in the RC-11 atomic file snapshot, replacing the earlier separate-file ledger path for this facade.

- The tests verify integrity after successful transitions and concurrent attempts.
- Illegal transitions and duplicate creation do not add audit records.
- The audit chain remains hash-chain tamper-evidence within the same local snapshot, not independent immutable storage.
- The underlying store remains a local single-host file store; crash durability and target-platform lock behavior are not fully verified.

Actor labels remain unauthenticated. No OIDC integration, runner, build or deployment is connected. Do not expose or use this prototype in production.
