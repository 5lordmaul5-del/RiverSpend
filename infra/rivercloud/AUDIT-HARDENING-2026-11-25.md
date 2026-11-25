# RiverCloud hardening audit — 25 November 2026

## Snapshot

PR #75 remains isolated on feat/rivercloud-core-2026-11-25. No merge, production deploy, server provisioning or paid operation was performed. The pull request has 60 changed files; this report records a focused code audit and corrections, not a completed certification of all changed files.

## Detailed source review

Inspected the control-plane and core prototype files, including server.mjs, rc11-state.mjs, approval-bound.mjs, rc12-hardening.mjs, audit-log.mjs, engine.mjs, lifecycle.mjs, rc13-identity.mjs, rc14-audit-sink.mjs, rc15-staging.mjs, rc16-readiness.mjs, rc7-worker.mjs, runner.mjs, worker-spec.mjs, Docker Compose, bootstrap and the RiverCloud documentation. The complete file-by-file review remains open.

## Corrections in the first increment

- Queue persistence: replaced independent queue read/write operations with the RC-11 transaction store. Digest duplicate detection and insertion occur inside one transaction; the queue is idempotent under concurrent requests.
- Queue API: retained loopback-only binding and token authentication; added explicit JSON content-type, bounded body size, no-store response headers, safe internal error handling and tests.
- Approval prototype: replaced Math.random nonce generation and separate read/modify/write with cryptographic random nonce and transaction-backed one-use consumption. Binding now requires a canonical project ID and 64-hex plan digest.
- Staging path: added safe-segment validation and rejection of traversal paths.
- Test-quality correction: the initial CI run found an incorrect assertion in lifecycle.test.mjs (the helper returns false for an invalid transition; the test incorrectly expected an exception). The assertion was corrected.
- Compose/bootstrap: pinned Caddy and whoami to exact version tags; removed a healthcheck that depended on wget absent from the minimal whoami image. Bootstrap no longer pipes a remote installer into a shell and requires Docker to be installed and reviewed manually.

## Test evidence from the first increment

- Focused local tests against an isolated reconstructed copy of affected modules: 16/16 passed. This is not a checkout of the repository.
- GitHub Actions full RiverCloud test suite: initial run 58/59; after correction, run 45597555182 passed 59/59 tests, shell syntax validation and Docker Compose configuration validation. No containers/services were started.

## New hardening increment (local validation and initial branch CI evidence)

- RC-11 lock creation now cleans up a lock file it created if metadata write/sync fails, instead of leaving an orphaned lock on that path.
- Audit append now uses serialized state transactions, verifies the existing chain before appending, sequence-checks records, and redacts sensitive keys and bounds nested detail values.
- Lifecycle create/transition operations now serialize updates, reject concurrent duplicate job creation and record audit entries; separate-file crash consistency remains a known limitation.
- RC-13 adds a tested least-privilege permission helper for the prototype role map. This is not authentication or route-level enforcement.
- Focused test run in an isolated reconstructed workspace: 29/29 passed. The repository could not be cloned locally because the environment could not resolve github.com; this run is not a checkout-based full suite. GitHub Actions run 45609163400 for commit 7f7772ff93f3e99a4f2c6b8ce05898191c455a0c completed successfully: 66/66 Node tests, bootstrap shell syntax and Docker Compose config validation. No containers/services were started. The local Git clone remained blocked by DNS, so the 29 focused tests were run in an isolated reconstructed workspace.

## Supply-chain and image review

- RiverCloud source modules use Node built-ins only; there is no package manifest in `infra/rivercloud`, so a Node package audit is not applicable to this scaffold.
- GitHub Actions checkout and setup-node are pinned to verified commit SHAs for v7.0.1 and v7.1.0. Runs 45609326685 (push) and 45609337469 (pull request) completed successfully with 66/66 tests and the shell/Compose validations.
- Caddy and whoami images remain version-tag pinned, not digest-pinned; an image-level scanner/SBOM was not run. Public package advisory lookups show Caddy package findings for some Minimos/Wolfi builds below 2.11.9-r0, but the exact layers in the selected image were not inspected, so this is not an image vulnerability verdict. See [Snyk Minimos](https://security.snyk.io/package/linux/minimos%3Alatest/caddy) and [Snyk Wolfi](https://security.snyk.io/package/linux/wolfi%3Alatest/caddy).
- The first CI Caddyfile validation attempt failed because the image required the explicit binary command (`caddy validate`); the command was corrected and verification is pending. This test starts only a short-lived validation container, not a RiverCloud service.

## Remaining blockers — not production eligible

- No OIDC authentication provider, MFA, authenticated approver, session revocation or route-level RBAC enforcement.
- No actual worker/runtime, build sandbox, network enforcement or staging host.
- Local lock files may remain after a crash; stale recovery remains manual and fail-closed.
- Lifecycle and audit records are separately persisted; a crash between writes can cause mismatch.
- No external protected audit delivery, retries, receiver, or immutable retention.
- Image tags are version-pinned but not pinned by digest; update/provenance policy remains.
- Backup/restore, dependency/supply-chain scan, staging rehearsal, performance tests and migration/cutover remain unperformed.

## Next gates

1. Await branch CI evidence for this increment and fix any failures.
2. Continue file-by-file review of the remaining documentation, panel, configuration and test files.
3. Integrate a real OIDC provider and MFA, with route-level RBAC, without homemade token verification.
4. Test lock/crash recovery on supported target platforms; retain fail-closed behavior.
5. Build an isolated worker and staging environment only after review and approval.
6. Execute backup/restore and security review; retain evidence.
7. Do not consider production or migration until every gate is independently verified and explicitly approved.
