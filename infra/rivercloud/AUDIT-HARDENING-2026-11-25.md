# RiverCloud hardening audit — 25 November 2026

## Snapshot

PR #75 remains isolated on feat/rivercloud-core-2026-11-25. No merge, production deploy, server provisioning or paid operation was performed. The pull request has **64 changed files**; this report records a focused code audit and corrections, not a completed certification of all changed files.

## Detailed source review

Inspected the control-plane and core files, including server.mjs, rc11-state.mjs, approval-bound.mjs, rc12-hardening.mjs, audit-log.mjs, engine.mjs, lifecycle.mjs, rc13-identity.mjs, rc14-audit-sink.mjs, rc15-staging.mjs, rc16-readiness.mjs, rc7-worker.mjs, runner.mjs, worker-spec.mjs, Docker Compose, Caddyfile, bootstrap, static panel, policy tests and the RiverCloud documentation. The complete file-by-file review remains open.

## Corrections in the first increment

- Queue persistence: digest duplicate detection and insertion occur inside one transaction; queue submissions are idempotent under concurrent requests.
- Queue API: loopback-only binding and bearer token; explicit JSON content-type, 8 KiB bounded body, no-store response headers, safe internal errors and tests.
- Approval prototype: cryptographic nonce and transaction-backed one-use consumption; binding includes canonical project, profile, staging target, immutable commit and plan digest.
- Staging path: safe-segment validation and rejection of traversal paths.
- Test-quality correction: CI found an incorrect lifecycle assertion (the helper returns false for invalid transitions); the assertion was corrected.
- Compose/bootstrap: exact version tags, removed a healthcheck requiring wget from a minimal image, and bootstrap no longer executes a remote installer piped to shell.

## CI evidence

- GitHub Actions run **45597555182** passed **59/59** tests, shell syntax and Compose validation.
- Run **45609163400** passed **66/66** Node tests plus shell and Compose validation.
- Runs **45609326685**, **45609337469**, **45609679828** and **45609697534** also passed 66/66 tests and relevant shell/Compose/Caddyfile validations.
- **Latest full PR workflow run 45617853040 — SUCCESS:** **74/74 Node tests**, bootstrap shell syntax, Docker Compose config and Caddyfile validation all passed. The workflow checked out the PR merge commit **053b7ed1da4e61e8c0c55f4ab0e29a908ea6521f**, corresponding to the then-current branch head **68b35757fa48244237401245d9f14482fa3bc368**. The Caddy validation used a short-lived container; no RiverCloud services were started. This is verified GitHub Actions evidence.

## RC-17 — same-file lifecycle/audit migration path

- Added `rc17-atomic-lifecycle.mjs` and tests as a migration path that keeps lifecycle jobs and their hash-chained audit records in the same RC-11 atomic snapshot, avoiding the cross-file commit window for this new API.
- Sequence/hash verification, sensitive-detail redaction, duplicate and transition checks.
- Plans are redacted for sensitive-key values before persistence. Tests cover secret/token key redaction, chain tampering, concurrent transitions and concurrent job creation.
- Local isolated reconstructed workspace: **8/8 passed**, using a copy of the reviewed RC-11 state-store source and the new RC-17 module/tests. This was not a repository checkout. The latest GitHub Actions run now also covers the module/tests.
- Actor labels are not authenticated. Existing `lifecycle.mjs` callers have not yet been migrated.

## RC-18 — request resource bounds

- `server.mjs` sets request timeout 15 s, headers timeout 10 s, socket inactivity timeout 15 s, keep-alive timeout 5 s and maximum 100 requests per socket. The JSON body remains bounded to 8 KiB.
- Local reconstructed isolated workspace: **2/2** server tests passed using copies of the reviewed state-store/server/queue/engine sources and the updated server test. This was not a checkout of the repository. The latest GitHub Actions run verifies these tests in the PR merge checkout.

## Supply-chain and image review

- RiverCloud source modules use Node built-ins only; no package manifest exists under `infra/rivercloud`, so a Node package audit is not applicable to this scaffold.
- GitHub Actions checkout and setup-node are pinned to verified SHA references.
- Caddy and whoami images remain version-tag pinned, not digest-pinned; an image-level scanner/SBOM was not run. Public advisory lookup was inconclusive for the exact image layers; it is not an image vulnerability verdict.
- Caddyfile validation passed in the latest workflow, but no SBOM or image vulnerability scan was performed.

## Remaining blockers — not production eligible

- No OIDC provider, MFA, authenticated approver, session revocation or route-level RBAC enforcement.
- No actual worker/runtime, build sandbox, enforced network isolation or staging host.
- Lock behavior and crash durability have not been tested on supported target platforms; stale recovery is fail-closed/manual for the RC-11 store.
- The existing lifecycle API and external audit file remain separate. RC-17 is an isolated migration path, not a completed migration.
- No independent protected audit delivery, retries, receiver or immutable retention.
- Image digest pinning, image scan/SBOM and dependency/supply-chain scan remain outstanding.
- Backup/restore, staging rehearsal, performance tests and migration/cutover remain unperformed.

## Next gates

1. Continue the remaining file-by-file review.
2. Integrate OIDC/MFA via a standard provider; do not implement custom token cryptography.
3. Migrate existing lifecycle callers to the same-file store only after tests and review.
4. Test lock/crash durability on target platforms.
5. Build an isolated worker and staging environment after review and approval.
6. Execute backup/restore and security review; preserve evidence.
7. Do not consider production or migration until every gate is independently verified and explicitly approved.
