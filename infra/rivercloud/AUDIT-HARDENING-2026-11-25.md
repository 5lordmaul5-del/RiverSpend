# RiverCloud hardening audit — 25 November 2026

## Snapshot

PR #75 remains isolated on feat/rivercloud-core-2026-11-25. No merge, production deploy, server provisioning or paid operation was performed. The pull request has **68 changed files**; this report records a focused code audit and corrections, not a completed certification of all changed files.

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
- Run **45617853040 — SUCCESS: 74/74** Node tests, bootstrap shell syntax, Compose config and Caddyfile validation. It checked PR merge commit **053b7ed1da4e61e8c0c55f4ab0e29a908ea6521f**, corresponding to branch head **68b35757fa48244237401245d9f14482fa3bc368** at the time.
- Run **45618332297 — SUCCESS: 77/77** Node tests, bootstrap and backup/restore shell syntax, Compose config and Caddyfile validation. It checked merge commit **dfc51e822fff837d85a1b38a538c99e7199b80a9**, corresponding to branch head **a0028168a34db04effab6045fae091982300a0a6**.
- **Latest run 45618630901 — SUCCESS: 78/78 Node tests**, bootstrap and backup/restore shell syntax, Compose config and Caddyfile validation. It checked merge commit **d7ab35a8b76aadf4b0ed90ef59760df9b269b96c**, corresponding to branch head **ea2e5de59cf27a392d2d0691deeb09ac3b8fe303**. The Caddy validation used a short-lived container only; no RiverCloud services were started.

## RC-17 — same-file lifecycle/audit migration path

- Added `rc17-atomic-lifecycle.mjs` and tests as a migration path that keeps lifecycle jobs and their hash-chained audit records in the same RC-11 atomic snapshot, avoiding the cross-file commit window for this new API.
- Sequence/hash verification, sensitive-detail redaction, duplicate and transition checks.
- Plans are redacted for sensitive-key values before persistence. Tests cover secret/token key redaction, chain tampering, concurrent transitions and concurrent job creation.
- Local isolated reconstructed workspace: **8/8 passed**, using a copy of the reviewed RC-11 state-store source and new RC-17 module/tests. This was not a repository checkout. Runs 45617853040 and 45618630901 also covered these module/tests.
- Actor labels are not authenticated. Existing `lifecycle.mjs` callers have not yet been migrated.

## RC-18 — request resource bounds

- `server.mjs` sets request timeout 15 s, headers timeout 10 s, socket inactivity timeout 15 s, keep-alive timeout 5 s and maximum 100 requests per socket. The JSON body remains bounded to 8 KiB.
- Local reconstructed isolated workspace: **2/2** server tests passed using copies of the reviewed state-store/server/queue/engine sources and the updated server test. This was not a checkout of the repository. Runs 45617853040, 45618332297 and 45618630901 verified these tests.

## RC-19 — backup/restore scripts

- Added local data snapshot and restore scripts, checksum verification, refusal of source symlinks, exclusion of temporary locks/write files, and restore into a new directory only with explicit confirmation.
- Local isolated workspace: **3/3** tests passed for round-trip, refusal of symlinked sources, and refusal to overwrite an existing restore target. Tests used temporary directories only, not production data or repository checkout.
- Runs 45618332297 and 45618630901 included the backup/restore tests and shell syntax validation. No production backup or restore was performed.
- This is not encrypted/off-site/immutable backup storage, and it does not ensure database-aware consistency while files are being written. A critical store should be stopped/quiesced for snapshots.

## RC-12 — fail-closed lock handling

- Disabled automatic stale-lock reclamation in the RC-12 helper. PID/rename-based recovery can race or be confused by PID reuse and namespaces.
- The helper preserves stale/malformed lock files and acquisition fails with a bounded timeout instead of deleting them automatically.
- Local isolated workspace: **5/5** tests passed for hash-chain integrity, preservation of old/recent/active/malformed locks, and timeout without reclaiming a stale lock. This was not a repository checkout.
- Run **45618630901** verified the updated RC-12 code and tests as part of the 78-test suite.

## RC-19 follow-up — restricted archive extraction

A focused review of the restore script found that checking only member paths did not adequately constrain archive entry types (for example, symbolic/hard links or special files). The restore path was changed to delegate extraction to a small Python 3 standard-library helper:

- Preflight rejects absolute paths, traversal components, backslash paths, duplicate entries, file/child conflicts, symlinks, hardlinks and special entries.
- Enforces a 100,000-entry limit and configurable aggregate uncompressed size limit (default 20 GiB).
- Extracts regular files/directories only, using restrictive permissions and exclusive/no-follow file creation where available.
- Uses a new target directory and removes it on extraction failure.
- Requires Python 3 on restore host; CI now checks helper syntax and exercises rejection tests.
- New regression tests build symlink and traversal archives and test size limits. These tests are pending CI evidence for this commit.

This reduces archive-extraction risk, but does not substitute for a formal threat review, external backup storage, encryption, or restore rehearsal.

## Additional control-plane audit findings

- `server.mjs` uses one static bearer token, not OIDC/MFA, and no route-level RBAC enforcement. The RC-13 claims validator is a helper and is not integrated with the server.
- The server is loopback-only and currently exposes only a plan/queue API; the runner remains disabled. Do not treat its bearer token as identity proof or expose it through a proxy.
- RC-17 audit integrity is hash-chain integrity inside the same state file, not independent immutability. A privileged attacker able to rewrite the state file can recalculate hashes; protected external audit remains a blocker.
- The restore archive parser is now restricted, but backup creation is still a local file snapshot and can be inconsistent while writes are active.

## Supply-chain and image review

- RiverCloud source modules use Node built-ins only; no package manifest exists under `infra/rivercloud`, so a Node package audit is not applicable to this scaffold.
- GitHub Actions checkout and setup-node are pinned to verified SHA references.
- Caddy and whoami images remain version-tag pinned, not digest-pinned; an image-level scanner/SBOM was not run. Public advisory lookup was inconclusive for the exact image layers; it is not an image vulnerability verdict.
- Caddyfile validation passed in runs 45617853040, 45618332297 and 45618630901, but no SBOM or image vulnerability scan was performed.

## Remaining blockers — not production eligible

- No OIDC provider, MFA, authenticated approver, session revocation or route-level RBAC enforcement.
- No actual worker/runtime, build sandbox, enforced network isolation or staging host.
- Lock behavior and crash durability have not been tested on supported target platforms; stale lock cleanup is manual/fail-closed.
- The existing lifecycle API and external audit file remain separate. RC-17 is an isolated migration path, not a completed migration.
- No independent protected audit delivery, retries, receiver or immutable retention.
- Backup/restore scripts are local and unencrypted; off-site retention, key separation, monitoring, restore drills and consistency controls remain outstanding.
- Image digest pinning, image scan/SBOM and dependency/supply-chain scan remain outstanding.
- Staging rehearsal, performance tests and migration/cutover remain unperformed.

## Next gates

1. Continue the remaining file-by-file review.
2. Integrate OIDC/MFA via a standard provider; do not implement custom token cryptography.
3. Migrate existing lifecycle callers to the same-file store only after tests and review.
4. Test lock/crash durability on target platforms.
5. Build an isolated worker and staging environment after review and approval.
6. Execute secure backup/restore and security review; preserve evidence.
7. Do not consider production or migration until every gate is independently verified and explicitly approved.
