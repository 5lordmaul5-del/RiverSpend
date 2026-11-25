# RiverCloud hardening audit — 25 November 2026

## Snapshot

PR #75 remains isolated on feat/rivercloud-core-2026-11-25. No merge, production deploy, server provisioning or paid operation was performed. The pull request has **73 changed files**; this report records a focused code audit and corrections, not a completed certification of all changed files.

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
- Run **45618630901 — SUCCESS: 78/78 Node tests**, bootstrap and backup/restore shell syntax, Compose config and Caddyfile validation. It checked merge commit **d7ab35a8b76aadf4b0ed90ef59760df9b269b96c**, corresponding to branch head **ea2e5de59cf27a392d2d0691deeb09ac3b8fe303**. The Caddy validation used a short-lived container only; no RiverCloud services were started.
- Run **45622097974 — SUCCESS: 87/87 Node tests**, plus shell/Python, Compose and Caddy validations; evidence for that earlier commit.
- Run **45622204547 — SUCCESS: 87/87 Node tests**, plus shell/Python, Compose and Caddy validations; checked branch head **e42613e8f3c4750469fe7c0296c895fc4890986d**.
- Run **45636789810 (run #106) — SUCCESS: 90/90 Node tests**, bootstrap shell, backup/restore shell and Python syntax, Compose config, and Caddy validation. It checked PR merge commit **1d7c30075d40007e5448017f49d22fae43b8049f**, corresponding to branch head **7682aa079f1916c2b7968610dc4c1624cf64a97b**. No RiverCloud services were started.
- Run **45636929135 (run #108) — SUCCESS: 90/90 Node tests** plus the same shell/Python, Compose and Caddy validations; this checked the report-only update.
- Run **45637386491 (run #114) — SUCCESS: 94/94 Node tests**, shell/Python, Compose and Caddy validation; checked branch head **16f2dafbcd7c2b913a86741cd61e6739f2aa0a86**. No RiverCloud services were started.

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

## Queue digest idempotency — cross-process evidence

- Added a separate-process test where six Node processes submit the same deployment plan simultaneously through `queuePlan`.
- Exactly one insertion is expected; five requests must return duplicate. The state snapshot and event list remain one record each.
- Reconstructed workspace: **1/1** passed (not a repository checkout).
- GitHub Actions **run 45622097974 — SUCCESS: 87/87 tests**, evidence for an earlier queue-idempotency commit, plus bootstrap, backup/restore and Python syntax, Compose and Caddy validation.

## RC-11/RC-12 — cross-process concurrency and crash lock evidence

- Added a dedicated process-level test file. Six separate Node processes concurrently add distinct jobs and preserve every event; six separate processes race the same job ID and only one succeeds; an orphan lock created by a simulated process exit is preserved and causes fail-closed timeout.
- Local reconstructed workspace: **3/3** passed using copies of the state store and test module (not a repository checkout).
- GitHub Actions run **45621273380 — SUCCESS: 84/84 tests**, including these process-level tests and shell/Python, Compose and Caddy validation.
- Crash recovery remains intentionally manual: orphan locks are not reclaimed. This test verifies fail-closed behavior, not automatic recovery or target-filesystem crash durability.

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
- New regression tests build symlink and traversal archives and test size limits. A reconstructed isolated workspace using copies of the branch scripts and tests passed **6/6** (not a repository checkout).

This reduces archive-extraction risk, but does not substitute for a formal threat review, external backup storage, encryption, or restore rehearsal. Usage instructions are in `RC19-BACKUP-RESTORE.md`.

### CI regression and correction evidence
- PR workflow run **45620539532 — FAILURE**: 77/81 tests passed; the 4 restore-related tests failed because the Python helper contained a syntax error in the backslash-path validation. The logs confirmed that the failure occurred before the restore logic executed.
- Corrected the validation block on the branch (head **4c470295cd598bb82a367cb40c2c3b0e52dc0f4d**). The exact fetched helper was syntax-checked and the reconstructed restore suite passed **6/6** locally in an isolated temporary workspace.
- Corrected branch CI **run 45621031596 — SUCCESS: 81/81 Node tests**, plus bootstrap shell, backup/restore shell and Python syntax, Compose configuration, and Caddy validation. This verified the branch head at the time; no RiverCloud service was started.

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


## RC-19 backup-source compatibility hardening

- Backup creation now refuses the filesystem root as a source, symlink/special entries (anything other than regular files or directories), and hardlinked files. This prevents creating archives that the restricted restore path would refuse or that could cause unintended broad snapshots.
- Added regression tests for hardlinked files, FIFOs, and root-source rejection; updated the symlink-source assertion.
- GitHub Actions run **45636789810 — SUCCESS: 90/90 Node tests**. The four validation steps (bootstrap, backup/restore shell + Python, Compose configuration, Caddy validation) also completed successfully.
- Tests used temporary directories and a root-source refusal check; no real data backup or restore was performed.


## RC-14 audit-envelope and delivery verification

- Added canonical envelope digest verification, with tamper detection.
- Added signed-delivery verification using HMAC-SHA256 and a bounded timestamp freshness window; URL descriptors reject non-HTTPS, userinfo, query and fragment.
- The verifier does not perform network delivery, receiver replay storage, or immutable retention. Replay deduplication remains a receiver responsibility (for example, by envelope hash).
- Corrected two test assertions found during local validation.
- Isolated local workspace: **9/9 RC-14 tests passed** using the exact source/test contents (not a full repository checkout).
- GitHub Actions **run 45637386491 — SUCCESS: 94/94 Node tests**, plus shell/Python, Compose and Caddy validation.


## RC-20 — container image digest pinning

- Pinned Caddy 2.11.9 to multi-platform index digest `sha256:4851e54a46b206517c574821bb5cc67f170d2156041e9fbc4c9193b45e84a75b`; this digest was also pulled and validated in CI.
- Pinned the demo whoami v1.12.0 image to multi-platform index digest `sha256:c4717a8d1f0134a7444e24f881160e033991f23027c6c5a9a3f8fd22e70d1d44`, sourced from the official Docker Hub tag page.
- CI Caddy validation now uses the same digest as Compose. GitHub Actions **run 45637690981 (run #119) — SUCCESS: 94/94 tests**, Compose config and Caddy validation.
- OAuth2 Proxy remains version-tag pinned, not digest-pinned. No SBOM or vulnerability scan has yet been run. Docker is unavailable in this local workspace; the validation evidence is from CI. No RiverCloud services were started.


## RC-13 identity-claim validation hardening

- Claim validator now accepts OIDC-style string or bounded array audiences, but still requires the configured issuer/audience match.
- Bounds subject/issuer lengths, token lifetime to 12 hours, safe-integer timestamps and 60-second future-issued skew; role arrays are bounded and allowlisted.
- Isolated local workspace: **9/9 identity tests passed** (not a full repository checkout).
- GitHub Actions **run 45637987956 (run #124) — SUCCESS: 97/97 Node tests**, shell/Python, Compose and Caddy validation.
- This remains only a claim-validation helper: it does not verify token cryptography or integrate with the server, provider, routes or authenticated approval records.


## RC-13 OIDC proxy configuration checks

- Added static tests for reverse-proxy mode, trusted Caddy IP, secure/HttpOnly/SameSite cookies, group allowlist, absence of skip-auth route/regex rules, and no host-published OAuth2 Proxy ports.
- Isolated local workspace: **3/3 OIDC proxy tests passed** (not a full repository checkout).
- GitHub Actions **run 45638333275 (run #132) — SUCCESS: 98/98 Node tests**, plus bootstrap, backup/restore/Python, Compose and Caddy validation.
- Advisory review: CVE-2026-40575 affects OAuth2 Proxy versions before 7.15.2; CVE-2026-76835 is reported for 7.15.2 through 7.15.4. The scaffold uses v7.15.6, sets the trusted proxy IP, and has no skip-auth rules. References: https://github.com/advisories/GHSA-7x63-xv5r-3p2x and https://euvd.enisa.europa.eu/enisa/EUVD-2026-65061.
- This was a targeted advisory/configuration review, not a full image vulnerability scan. OIDC provider login, MFA and route-level RBAC remain untested and unintegrated.


## RC-20 follow-up — digest pin and Compose boundary regression tests (25 November 2026)

- Pinned OAuth2 Proxy v7.15.6 to image digest `sha256:c3415e8660af553f5e18f5d90db050614c02493c0ac6260ac59442f6d9b12048`, replacing the floating tag-only reference. The digest was cross-checked against a public deployment manifest; this is a reference check, not a formal registry-signature verification.
- Added `compose-security.test.mjs` regression tests: require all three Compose images to use SHA-256 digest references, verify that only Caddy publishes host ports, and reject Docker/containerd socket mounts, privileged mode, host networking, or non-placeholder secrets in the example environment.
- The initial reconstructed test run found a parser-regex defect in the new service-block test (2/3 passed); the parser was corrected. A reconstructed temporary workspace then passed **3/3** policy tests. This is not a repository checkout.
- GitHub Actions run **45646823737 (#142) — SUCCESS: 101/101 Node tests**, bootstrap shell syntax, backup/restore shell and Python syntax, Compose config, and Caddy validation. The Caddy validation used a temporary validation container only; the RiverCloud stack was not started.
- Run #142 verifies head `4a63e38e7b17ebbb1f89c45e3da47efd84d3e044`; the report-only update is the next commit and will require a fresh CI run.
- Remaining security gates: official registry digest verification/scan, image SBOM/CVE analysis, OIDC integration and route-level RBAC, real runner isolation, external audit storage and staging.


## RC-9 facade migration to RC-17 atomic lifecycle (25 November 2026)

- Migrated the `lifecycle.mjs` facade from two separately committed state/audit files to the RC-17 same-snapshot lifecycle/audit API.
- Added a `readLifecycle` facade for reading lifecycle jobs and the verified audit chain from the same state file.
- Rewrote the lifecycle regression tests to verify successful transitions, rejected transitions, concurrent one-time approval transitions, and duplicate job creation while checking job/audit integrity together.
- Updated RC-9/RC-17 docs. The prior separate-file crash window is no longer used by this facade; the RC-8 audit module remains a standalone ledger prototype and is not a replacement for protected external storage.
- The migration is committed on the isolated branch. A reconstructed temporary workspace passed **5/5 lifecycle-facade tests** (not a repository checkout). GitHub Actions run **45647177095 (#154) — SUCCESS: 101/101 tests** plus shell/Python, Compose and Caddy validation verified this migration commit. No production data is involved.
- The prototype actor field remains unverified; OIDC/RBAC integration and caller audit are still required before any deployment.


## CI evidence — lifecycle facade migration

- Run **45647177095 (#154) — SUCCESS: 101/101 tests**, shell syntax for bootstrap and backup/restore, Python extractor syntax, Compose configuration, and Caddy validation. This run verifies the RC-9 facade migration to RC-17, Compose digest pin, and the Compose security regression tests on commit `0c1e359a09c0eb09a8f723b818b7611be325095e`.
- Caddy validation used a temporary validation container; no RiverCloud services were started. The report-only update following this run is not covered by this CI result and will be treated separately.


## RC-17 audit replay and state-consistency guard (25 November 2026)

- Audit verification now replays the permitted lifecycle transitions instead of checking only sequence/hash continuity.
- Read-time validation cross-checks the replayed state and creation digest against the persisted lifecycle jobs; deleted audit history, mismatched job state, duplicate IDs, and illegal replay sequences return integrity failures.
- Added regression tests for state/audit divergence, missing audit records and an illegal transition whose hash chain was recomputed, to ensure transition-policy validation is not bypassed by recomputing hashes.
- Reconstructed temporary workspace: **16/16 lifecycle facade + RC-17 tests passed** using fetched source/test copies, not a repository checkout. GitHub Actions run **45647746438 (#170) — SUCCESS: 105/105 tests** plus shell/Python, Compose and Caddy validation now verifies the audit replay and state-consistency guard.
- Hash-chain integrity is still local tamper-evidence only: a privileged writer can rewrite the entire snapshot and recompute a chain. Independent protected external audit remains a blocker.


## RC-18 request media-type strictness (25 November 2026)

- Changed the API JSON content-type gate from a prefix check to exact media-type parsing (parameters such as charset remain permitted; misleading types like `application/jsonp` are rejected).
- Added an HTTP regression test for the misleading content-type. Reconstructed workspace: **3/3 server tests passed** using fetched source/test copies, not a repository checkout.
- GitHub Actions run **45647746438 (#170) — SUCCESS: 105/105 tests** verified the server change along with the prior RC-17 audit replay hardening and Compose/security checks. This run also completed bootstrap, backup/restore shell and Python syntax, Compose configuration, and Caddy validation.
- No RiverCloud stack was started; Caddy validation used a temporary validation container only.


## RC-10 cross-process approval consumption and RC-15 staging plan validation (25 November 2026)

- Added a six-process race against one approval token using the existing RC-11 transaction lock. Exactly one process consumes the token; five receive the used/missing rejection. State is checked after the race: the approval is marked used and exactly one `approval_consumed` event exists.
- GitHub Actions run **45657318087 (#173) — SUCCESS: 106/106 tests** and PR run **45657341865 (#174) — SUCCESS: 106/106 tests** verify the process-level approval race and existing suite, plus shell/Python, Compose and Caddy validation.
- RC-15 staging plan validator now rejects projects outside the explicit `riverspend` allowlist and rejects forged profile limits (network, read-only flag, timeout) rather than trusting values supplied in the worker specification.
- Intermediate CI runs **45657406044 (#175), 45657417788 (#176), and 45657431302 (#177) — FAILURE** caught an invalid regular-expression escape in the first staging-path validation change. The failing test suite reported a syntax error (`Invalid regular expression flags`); this was a validator code defect, not an environment failure.
- Corrected the staging path regular-expression escaping. GitHub Actions run **45657470568 (#178) — SUCCESS: 108/108 tests**, and PR run **45657482972 (#179) — SUCCESS: 108/108 tests** verified the corrected validator and new tests, plus bootstrap, backup/restore shell and Python syntax, Compose configuration, and Caddy validation.
- Caddy validation used a temporary container only. The RiverCloud stack and runner were not started.
- These validations remain prototypes: staging plans are not executable, OIDC/RBAC are not integrated into the API, the approver label is not authenticated, and external audit delivery remains unconnected.


## RC-11 state-file read hardening — 25 November 2026

- Audited the shared RC-11 read path used by queue/state consumers. Previously, Node's `readFile` followed a state-file symlink and accepted any filesystem object that could be read.
- Changed the state read to open with `O_NOFOLLOW` and `O_NONBLOCK`, then verify the opened descriptor is a regular file before parsing. Symlink paths are rejected; non-regular files (including directories) are rejected. The implementation fails closed if the required safe-open flags are unavailable.
- Added regression tests that ensure a symlink target is neither read nor replaced by a transaction, and that a directory cannot be accepted as a state file.
- Reconstructed temporary workspace (exact fetched source/test copies, not a repository checkout): **9/9 RC-11 state tests passed**.
- GitHub Actions **run 45668356543 (#187) — SUCCESS: 110/110 Node tests**, bootstrap shell syntax, backup/restore shell and Python extractor syntax, Compose validation, and Caddy validation. The logs confirm tests **49** and **50** cover symlink and directory rejection respectively.
- No RiverCloud services were started; Caddy validation used a temporary validation container. No production state or credentials were touched.

### Limitations

- This protection addresses symlink/special-file reads on the Linux CI/runtime path. The state store is still a prototype, not a database; target-platform crash durability, bounded file growth, authenticated API access and production-grade backup remain separate gates.


## RC-20 — prepared-run integrity gate (25 November 2026)

- Added `verifyPreparedRun` to independently revalidate the runner plan schema against the allowlist, the plan digest/run ID, strict prepared status, timestamp, exact fail-closed safety flags, and a SHA-256 envelope checksum.
- Added regression tests for altered plans/digests/run IDs, changed status, unsafe/extra safety flags, altered envelope checksum, unexpected fields, and the still-disabled execution function.
- Added `RC20-RUN-ENVELOPE.md` documenting the gate and reproducible command.
- **Important limitation:** the unkeyed envelope checksum is tamper-evidence, not authentication or authorization. The runner remains disabled; this helper is not approval, OIDC, RBAC or sandbox enforcement.
- Previous verified head before this increment: GitHub Actions run **45668468565 (#189) — SUCCESS**, 110/110 tests and shell/Python, Compose and Caddy validation.
- The new runner code/tests/docs/report commits are awaiting a fresh CI result; no test result is claimed for this increment until GitHub Actions completes.

- CI evidence for the RC-20 increment: GitHub Actions run **45673597279 (#195) — SUCCESS: 113/113 Node tests** and run **45673611842 (#196) — SUCCESS: 113/113 Node tests**, including bootstrap shell, backup/restore and Python syntax, Compose validation and Caddy validation. The logs show runner tests 100–104 passed and **0 failures**. No RiverCloud services were started; Caddy validation used a temporary validation container only.


## RC-21 — lock-release ownership hardening (25 November 2026)

- Audited the RC-11 lock release path: previously, cleanup closed the acquired lock handle and then unconditionally unlinked the pathname, so a pathname replacement between acquisition and release could cause cleanup to remove a different object.
- The store now retains the opened lock's device/inode identity and unlinks only when `lstat` confirms the pathname still refers to the same regular file. The descriptor remains open until after the ownership check/removal. Failed acquisition cleanup uses the same identity check.
- Added a regression test that replaces the lock path with a symlink during a transaction; a nested transaction must time out and the replacement symlink must remain after cleanup.
- GitHub Actions **45673921124 (#199) and 45673939583 (#200) — SUCCESS** for the intermediate lock-owner implementation, 113/113 tests each. Final regression commit **45673941409 (#201) and 45673954788 (#202) — SUCCESS: 114/114 tests each**, including shell/Python, Compose and Caddy validation. Logs confirm test 51, lock replacement preservation, and **0 failures**.
- Added `RC21-LOCK-RELEASE.md`. This reduces release-path risk but does not prevent a hostile process with write access to the private state directory from unlinking the lock during an active transaction; directory permissions and a stronger database/OS locking model remain required.
- No RiverCloud service or runner was started; no live deployment, merge, server, spending, or production data/credential change occurred.
