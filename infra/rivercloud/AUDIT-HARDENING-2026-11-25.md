# RiverCloud hardening audit — 25 November 2026

## Snapshot

PR #75 remains isolated on feat/rivercloud-core-2026-11-25. No merge, production deploy, server provisioning or paid operation was performed. The pull request has 55 changed files; this report records a focused code audit and the corrections made in this increment, not a completed certification of all 55 files.

## Detailed source review

Inspected the control-plane and core prototype files, including server.mjs, rc11-state.mjs, approval-bound.mjs, rc12-hardening.mjs, audit-log.mjs, engine.mjs, lifecycle.mjs, rc13-identity.mjs, rc14-audit-sink.mjs, rc15-staging.mjs, rc16-readiness.mjs, rc7-worker.mjs, runner.mjs, worker-spec.mjs, Docker Compose, bootstrap and the RiverCloud documentation. The complete 55-file review remains open.

## Corrections in this increment

- Queue persistence: replaced independent queue read/write operations with the RC-11 transaction store. Digest duplicate detection and insertion occur inside one transaction; the queue is idempotent under concurrent requests.
- Queue API: retained loopback-only binding and token authentication; added explicit JSON content-type, bounded body size, no-store response headers, safe internal error handling and tests.
- Approval prototype: replaced Math.random nonce generation and separate read/modify/write with cryptographic random nonce and transaction-backed one-use consumption. Binding now requires a canonical project ID and 64-hex plan digest.
- Staging path: added safe-segment validation and rejection of traversal paths.

## Test evidence

A focused local test run against an isolated, reconstructed copy of the changed modules completed 16/16 tests successfully (queue concurrency, duplicate idempotency, API authentication/body limits, approval binding and concurrent one-use, and staging path validation). This was not a checkout of the repository and does not replace the full PR test suite. A branch-scoped GitHub Actions workflow is added to run the repository's RiverCloud tests. Its result is pending.

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

1. Run the full branch test workflow and fix only evidence-backed failures.
2. Continue file-by-file review of the remaining documentation, panel, configuration and test files.
3. Design and integrate an actual OIDC/RBAC layer, without homemade token verification.
4. Harden audit/lifecycle persistence and lock/crash recovery.
5. Build an isolated worker and staging environment only after review and approval.
6. Execute backup/restore and security review; retain evidence.
7. Do not consider production or migration until every gate is independently verified and explicitly approved.
