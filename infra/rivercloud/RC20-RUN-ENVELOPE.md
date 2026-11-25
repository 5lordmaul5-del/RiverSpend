# RC-20 — prepared-run integrity gate

The runner remains disabled. `prepareRun` produces a plan-only record, and `verifyPreparedRun` independently revalidates its schema, allowlisted plan, plan digest, run ID, timestamp, fixed fail-closed safety flags, and envelope checksum.

The envelope checksum is **tamper-evidence for accidental or stale modifications, not authentication**: a party able to replace the record can recompute an unkeyed SHA-256 digest. The plan digest is the value that a future authenticated, one-use approval must bind to. No worker may treat this helper as authorization.

The verifier rejects:
- unexpected envelope or safety fields;
- status other than `prepared_not_executed`;
- any safety flag set to true;
- non-canonical/invalid plan fields or commit;
- mismatched plan digest or run ID;
- invalid timestamps or envelope checksum.

Reproducible check: `node --test infra/rivercloud/runner.test.mjs`.

Execution remains unconditionally disabled until an isolated runtime, real identity/RBAC, authenticated approver binding, immutable artifact/source binding, and audit integration are implemented and reviewed.
