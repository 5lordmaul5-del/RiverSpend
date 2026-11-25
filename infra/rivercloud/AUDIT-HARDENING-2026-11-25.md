# RiverCloud hardening audit — 25 November 2026

## Snapshot

PR #75 remains isolated on feat/rivercloud-core-2026-11-25. No merge, production deploy, server provisioning or paid operation was performed. The pull request has 60 changed files after this increment; this report records a focused code audit and corrections, not a completed certification of all changed files.

## Detailed source review

Inspected the control-plane and core prototype files, including server.mjs, rc11-state.mjs, approval-bound.mjs, rc12-hardening.mjs, audit-log.mjs, engine.mjs, lifecycle.mjs, rc13-identity.mjs, rc14-audit-sink.mjs, rc15-staging.mjs, rc16-readiness.mjs, rc7-worker.mjs, runner.mjs, worker-spec.mjs, Docker Compose, bootstrap and the RiverCloud documentation. The complete file-by-file review remains open.

## Corrections in this increment

- Queue persistence: replaced independent queue read/write operations with the RC-11 transaction store. Digest duplicate detection and insertion occur inside one transaction; the queue is idempotent under concurrent requests.
- Queue API: retained loopback-only binding and token authentication; added explicit JSON content-type, bounded body size, no-store response headers, safe internal error handling and tests.
- Approval prototype: replaced Math.random nonce generation and separate read/modify/write with cryptographic random nonce and transaction-backed one-use consumption. Binding now requires a canonical project ID and 64-hex plan digest.
- Staging path: added safe-segment validation and rejection of traversal paths.
- Test-quality correction: the initial full CI run found one incorrect assertion in lifecycle.test.mjs (the helper returns false for an invalid transition; the test incorrectly expected an exception). This assertion has been corrected; the implementation itself was not changed for this finding.

## Test evidence

- Focused local tests against an isolated reconstructed copy of affected modules: 16/16 passed. This is not a checkout of the repository.
- GitHub Actions full PR suite: initial run 58/59 passed; the one failure was the assertion defect described above. The corrected suite is awaiting its next run.

## Remaining blockers — not production eligible

- No OIDC authentication provider, MFA, authenticated approver, session revocation or fully enforced RBAC.
- No actual worker/runtime, build sandbox, network enforcement or staging host.
- Local lock files may remain after a crash; manual review/recovery is required.
- The existing local audit ledger and lifecycle persistence are not yet a unified transactional store and need concurrency/crash tests.
- No external protected audit delivery, retries, receiver, or immutable retention.
- Docker image tags are not pinned to digests; update/provenance policy remains.
- Bootstrap uses a remote convenience installer pipeline and needs provenance/version review before any host use.
- Backup/restore, dependency/supply-chain scan, staging rehearsal, performance tests and migration/cutover remain unperformed.

## Next gates

1. Confirm the full branch test workflow passes and fix evidence-backed failures.
2. Continue file-by-file review of the remaining documentation, panel, configuration and test files.
3. Design and integrate an actual OIDC/RBAC layer, without homemade token verification.
4. Harden audit/lifecycle persistence and lock/crash recovery.
5. Build an isolated worker and staging environment only after review and approval.
6. Execute backup/restore and security review; retain evidence.
7. Do not consider production or migration until every gate is independently verified and explicitly approved.
