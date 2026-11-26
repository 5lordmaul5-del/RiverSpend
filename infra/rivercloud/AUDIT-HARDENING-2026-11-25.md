# RiverCloud hardening audit — 25 November 2026

## Snapshot

PR #75 remains isolated on feat/rivercloud-core-2026-11-25. No merge, production deploy, server provisioning or paid operation was performed. PR #75 currently has **101 changed files**; this report records a focused code audit and corrections, not a completed certification of all changed files.

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



## RC-22 — verified-identity approval helper and separation of duties (25 November 2026)

- Added opt-in `rc22-approval-identity.mjs`: it gates approval issuance/consumption through RC-13 claim validation (configured issuer/audience, bounded time window, known roles) and the `approve_jobs` permission. The identity verifier callback must be supplied by a trusted caller; this helper does not itself verify JWT/OIDC signatures, fetch JWKS, or authenticate sessions.
- Approval records use a stable SHA-256 label derived from issuer and subject rather than a free-form caller label.
- Identity-gated consumption rejects the same identity that issued the approval (separation of duties); a different authorized identity may consume it once via the existing atomic store guard.
- Added regression tests for permission denial, rejected verification callback, issuer/audience rejection, self-consumption rejection, distinct-identity consumption and one-use replay.
- This module is opt-in; no server route, OIDC provider or runner is wired to it. Legacy approval interfaces remain prototype paths. The test verifier is a stub, not a cryptographic provider integration.
- GitHub clone attempt failed at DNS resolution (`github.com` could not be resolved); no checkout-based suite could be run in this environment. A reconstructed temporary workspace built from exact fetched branch copies of `approval-bound.mjs`, `rc11-state.mjs`, `rc13-identity.mjs`, the RC-22 helper and tests passed **16/16** across the RC-22, RC-13 identity and legacy approval test files. This is a targeted reconstructed-workspace result, not a full checkout or CI result. GitHub Actions for this increment is not independently confirmed.
- Documentation: `RC22-APPROVAL-IDENTITY.md`.


## RC-23 — explicit RBAC permission catalog (25 November 2026)

- Audited the RC-13 permission helper and found that the owner wildcard returned true for arbitrary, unrecognized permission names. Unknown actions should fail closed even for privileged roles.
- Added an explicit permission catalog; `hasPermission` now rejects unknown permission names before role evaluation. Added a regression assertion for owner/unknown-permission denial.
- Added `RC23-RBAC-PERMISSION-CATALOG.md`. GitHub Actions run **45685524487 (#226) — SUCCESS: 117/117 Node tests**, 0 failures, plus bootstrap shell, backup/restore and Python syntax, Compose configuration, and Caddy validation. Caddy validation used a temporary container only. This verifies head `80d2ff5a560fb57cecbf1cb1dbd4f8bb02aec3b2`; no RiverCloud service or runner was started.


## RC-24 — mandatory approval-consumer identity label (25 November 2026)

- Code review found that the legacy approval-consumption API allowed callers to omit `consumerIdentity`, bypassing its self-consumption comparison. The identity-gated RC-22 wrapper always supplied a value, but the lower-level helper remained permissive.
- Direct consumption now rejects missing/blank/oversized identity labels and rejects a label equal to the stored approver before consuming the token. The one-use transaction remains unchanged.
- Updated the legacy approval tests and six-process race test to pass an explicit consumer label; added regressions for missing label and self-consumption. Labels remain unverified and caller-supplied in this low-level helper; this does not complete OIDC/RBAC route integration.
- Starting-head CI evidence: run **45685641423 (#228) — SUCCESS**, 117/117 Node tests and the bootstrap, backup/restore/Python, Compose and Caddy validations. This validates the previous head `4bb7cebe3baabe6b0874af28823aeddf8825c068`, not the RC-24 changes. RC-24 changes require a fresh CI run before being considered tested.


### RC-24 CI feedback — test fixture correction

- Push/PR runs **45691902249 (#229)** and **45691912666 (#230)** reached the Node suite and failed 1 of 117 tests. The failure was in the changed-commit regression fixture: it omitted the newly mandatory `consumerIdentity`, so the test asserted the old rejection instead of exercising the binding mismatch.
- The implementation's mandatory identity check and the process-level race test passed in those runs. Corrected the fixture to supply a distinct consumer label. The next CI result is required before declaring RC-24 verified.


### RC-24 CI closeout — verified

- Corrected the changed-commit test fixture to pass the required consumer identity label.
- GitHub Actions run **45692018323 (#231) — SUCCESS: 117/117 tests**, plus bootstrap, backup/restore and Python syntax, Compose configuration, and Caddy validation.
- PR run **45692028589 (#232) — SUCCESS: 117/117 tests**, with the same validation steps. Both runs verify commit `1bd4d5833f6df767b73acbe452c88626fcdb82de`.
- The earlier runs #229/#230 failed only at the changed-commit test fixture because the call omitted the now-required consumer identity; the implementation and multi-process race tests passed. The fixture was corrected and verified by #231/#232.
- Vercel preview checks for this branch remain rate-limited (`Deployment rate limited — retry in 24 hours`) on the `river-spend` and `riverspend-rspc` contexts. This is separate from RiverCloud CI; no production deployment was initiated.


## RC-25 — co-locate approval and lifecycle state (25 November 2026)

- Audited the RC-22 helper and RC-9/RC-17 facade. Approvals were stored in `state.json`, while lifecycle jobs and their hash-chain were in `lifecycle.json`, creating a separate-file boundary between approval and lifecycle records.
- Moved the approval-bound store path to `lifecycle.json` so approval records/events and RC-17 jobs/audit are co-located within the same RC-11 transaction snapshot.
- Updated the six-process approval race and RC-22 identity tests. The RC-22 regression now creates a lifecycle job, consumes its approval, and verifies the approval-used event and lifecycle/audit record in the same snapshot.
- **Remaining atomicity gap:** consuming the approval and transitioning the lifecycle job still occur in separate transactions. The test confirms the job remains pending after the approval is consumed; a future RC increment must implement a single transaction for consume + approved-state transition before execution is possible.
- RC-25 changes are awaiting fresh GitHub Actions verification. No services or runner were started.


### RC-25 targeted reconstructed-workspace verification

- Reconstructed a temporary workspace from the exact fetched branch sources for RC-11, RC-13, RC-17, RC-22, the approval-bound module and their targeted tests; this is not a full repository checkout.
- Node 22 run: **8/8 tests passed** (approval binding/replay, process-level one-use race, RC-22 identity gate and co-location with the lifecycle snapshot). The full repository CI run for code head `874ab71163f879a58cf2d6a345bb02bd9e213c2a` has not yet been surfaced; do not treat the targeted workspace result as full-suite CI.
- The test explicitly confirms the remaining gap: the approval is consumed in the shared snapshot while the lifecycle job stays `pending`; consume + transition still need a single transaction.

### RC-25 CI closeout — verified

- GitHub Actions run **45692378410 (#235) — SUCCESS: 117/117 tests** and PR run **45692390510 (#236) — SUCCESS: 117/117 tests** verify code commit `874ab71163f879a58cf2d6a345bb02bd9e213c2a`. Both also passed bootstrap shell syntax, backup/restore and Python extractor syntax, Compose config, and Caddy validation. No RiverCloud services were started.
- The reconstructed targeted workspace result **8/8** remains supplemental evidence; the repository CI results above are the full 117-test suite.

### Targeted dependency-advisory review (25 November 2026)

- **OAuth2 Proxy v7.15.6:** release page identifies v7.15.6 as the latest release dated 5 November 2026 and lists vulnerabilities addressed. Targeted advisory review found several configuration-dependent authentication bypasses fixed at v7.15.2 or later; the scaffold is v7.15.6 and has no skip-auth route/regex rules. This is not a complete image scan or SBOM.
- **Caddy 2.11.9:** targeted review of GHSA-r766-rf9f-588h (fixed in 2.11.8) and CVE-2026-55458 (fixed in 2.11.5) indicates the pinned version is newer than those fixes. The current Caddyfile contains only `encode` and `reverse_proxy`; it does not use host-derived roots, `file_server`, `php_fastcgi`, or rewrite/file-matcher rules cited in those advisories. This is a configuration/precondition review, not proof that the image is free of CVEs.
- **Outstanding:** full SBOM/image CVE scan, image-signature verification, and exact whoami image scan remain unperformed.
- References: https://github.com/oauth2-proxy/oauth2-proxy/releases ; https://github.com/advisories/GHSA-7x63-xv5r-3p2x ; https://github.com/advisories/GHSA-c5c4-8r6x-56w3 ; https://github.com/advisories/GHSA-pxq7-h93f-9jrg ; https://github.com/caddyserver/caddy/security/advisories/GHSA-r766-rf9f-588h ; https://github.com/advisories/GHSA-8qx7-j2v2-x6q5


## RC-26 — atomic approval consumption and job transition (25 November 2026)

- Audited the RC-25 gap: approval consumption and lifecycle approval were previously separate transactions, allowing a token to be consumed while the job remained pending.
- Added lifecycle-bound approval issuance requiring an existing pending job and matching digest, and refusing a second active token for the same job.
- Added atomic consume + pending-to-approved transition in RC-17: checks token expiry, binding, distinct consumer, job state/digest and audit replay; marks the token used, appends the consume event, transitions the job, and adds the hash-chain transition in the same RC-11 snapshot.
- Updated the legacy binding, identity-gated and six-process race tests to assert approved job state and audit-chain integrity. Added regressions for issuance without a pending job and failed consumption rollback.
- **CI evidence pending:** do not count this increment as verified until the new branch commit and the subsequent report-only commit pass GitHub Actions.
- Runner remains disabled; no real OIDC authentication or route-level RBAC is connected.


### RC-26 CI feedback — fixture corrections (25 November 2026)

- Run #241 (**45707915332**) reached the Node suite and failed 4 tests. Failures exposed missing lifecycle-job setup in approval fixtures/process race and an RC-22 assertion still expecting `pending` after successful atomic consumption. A process-test insertion also contained a malformed newline.
- These were test-fixture/integration errors in the increment, not reported as passed. Corrected the fixtures and expected state to `approved`; the next CI run is required before this increment is considered verified.


### RC-26 CI closeout — verified

- The initial code commit failed push/PR runs **45707915332 (#241)** and **45707923656 (#242)** with four test-fixture/integration failures. The fixtures were corrected; the failed runs are retained as evidence, not counted as passing.
- Corrected commit **96ce2ce439a31cd453ab41862a88d1f323e5d426** was verified by GitHub Actions **45708072045 (#243) — SUCCESS: 119/119 Node tests**, and PR run **45708081331 (#244) — SUCCESS: 119/119 Node tests**. Both runs also passed bootstrap shell syntax, backup/restore and Python extractor syntax, Compose config, and Caddy validation. No RiverCloud service or runner was started.
- Atomic approval consumption now transitions the lifecycle job to `approved` and writes the approval-used event and hash-chain transition in the same RC-11 snapshot. The six-process approval race asserts one successful consumer, five rejections, approved job state and valid audit replay.
- The next report-only commit requires its own CI result before it is considered verified.


## RC-27 — signed audit-delivery replay guard contract (25 November 2026)

- Added a random 128-bit nonce to the signed delivery descriptor; HMAC covers timestamp, nonce and exact body.
- Verification now requires a caller-supplied asynchronous replay-store callback and fails closed when it is absent, rejects duplicates, or reports storage errors. The callback must atomically persist the nonce; no receiver storage or network delivery is implemented here.
- Added tests for nonce generation, missing replay store, replay rejection and fail-closed storage errors. **CI evidence pending** for this increment and report-only closeout.


### RC-27 CI closeout — verified

- GitHub Actions **run 45708327208 (#247) — SUCCESS: 122/122 Node tests**, and PR run **45708344831 (#248) — SUCCESS: 122/122** verify code commit `92cadbb4218cb37f730c00c72dfb5b54c16084e3`.
- Both runs also passed bootstrap shell syntax, backup/restore and Python extractor syntax, Compose configuration, and Caddy validation. No network delivery or RiverCloud services were started.
- Tests verify signed nonce generation, mandatory replay-store callback, repeated nonce rejection, and fail-closed callback errors. The durable receiver-side replay store remains unimplemented.
- The next report-only commit requires its own CI verification.


### RC-27 report-only CI closeout

- Report/doc commit `09cbd6bccc8e6dd7581a8b923f58f4769c3a7dbe` was verified by **45708424593 (#249) and 45708437672 (#250) — SUCCESS: 122/122 tests** each, plus bootstrap, backup/restore and Python syntax, Compose configuration, and Caddy validation. The source code is unchanged from the verified RC-27 code commit.


### RC-27 report-only commit verification

- The report-only commit `63a30d6da170a301df0a29fad5241bd5c2dbc07c` was verified by GitHub Actions **45708543769 (#251) and 45708555561 (#252) — SUCCESS: 122/122 tests** each, plus bootstrap, backup/restore/Python, Compose configuration and Caddy validation. The code was unchanged from RC-27's verified source commit.
\n\n## RC-28 — directory-sync failure visibility (25 November 2026)\n\n- Audited RC-11 transaction durability: the post-rename directory sync failure was previously swallowed, hiding a durability uncertainty from callers.\n- Changed the store to propagate a coded `state_commit_durability_uncertain` error with `commitApplied=true` after rename if directory sync fails; this is explicitly a potentially committed operation, and callers must read/reconcile before retry.\n- Added deterministic fault-injection coverage for the post-rename sync failure, state visibility and subsequent lock release. **CI evidence pending** for this increment and report-only closeout.\n\n\n### RC-28 CI feedback — correction to the initial commit\n\n- The first RC-28 commit `199548d0cad48d1d37bc16db630a98830000c1da` contained a malformed newline in the helper insertion and omitted the new `syncDirectory` option from the transaction signature. The correction commit fixes both before tests are counted. CI evidence for the corrected commit is pending.\n

### RC-28 CI closeout — verified

- The corrected code commit `22a20c1e18ec8f497ce0ea2db77707d810743231` was verified by **45708818257 (#257) — SUCCESS: 123/123 Node tests** and PR run **45708830490 (#258) — SUCCESS: 123/123**. Both also passed bootstrap shell, backup/restore and Python syntax, Compose configuration and Caddy validation.
- The initial commit `199548d0cad48d1d37bc16db630a98830000c1da` failed runs #255/#256 due syntax errors from malformed newline insertion and missing option wiring. The corrected commit is the one counted as verified.
- The fault-injection test confirms that after rename, directory-sync failure is reported as durability uncertainty, the committed state remains visible, and the lock is released. This does not establish crash durability on every filesystem.
- Report-only commit verification remains pending.


### RC-28 report-only CI closeout

- The report-only commit `3230670d04de6620c464baefaf7f3cf18ab15fe6` was verified by **45708935211 (#259) and 45708941875 (#260) — SUCCESS: 123/123 Node tests** each, plus bootstrap, backup/restore and Python syntax, Compose configuration and Caddy validation. Code is unchanged from the verified RC-28 source commit.


### RC-28 report-only CI closeout

- Report/doc commit `8fe5ca2c8af182d8876758c61934d32c400b6f16` was verified by **45709047882 (#261) and 45709056422 (#262) — SUCCESS: 123/123 Node tests** each, plus bootstrap, backup/restore and Python syntax, Compose configuration and Caddy validation. Code is unchanged from the corrected RC-28 source commit.


### RC-28 report-only CI closeout

- Report-only commit `2b98632c5c587ac58c18c224e1a8be62ca97f8d8` was verified by **45709159040 (#263) and 45709171430 (#264) — SUCCESS: 123/123 Node tests** each, plus bootstrap, backup/restore and Python syntax, Compose configuration and Caddy validation. Code is unchanged from the corrected RC-28 source commit.


### RC-28 report-only CI closeout

- Report-only commit `d3c629bca31253f059da2c95f2c0ab2644490b41` was verified by **45709253095 (#265) and 45709259403 (#266) — SUCCESS: 123/123 Node tests** each, plus bootstrap, backup/restore and Python syntax, Compose configuration and Caddy validation. Code is unchanged from the corrected RC-28 source commit.


### RC-28 report-only CI closeout

- Report-only commit `c0902aef1d22b92fe5ef4906a775841d26c59ba0` was verified by **45709331820 (#267) and 45709342429 (#268) — SUCCESS: 123/123 Node tests** each, plus bootstrap, backup/restore and Python syntax, Compose configuration and Caddy validation. Code is unchanged from the corrected RC-28 source commit.



## RC-29 — approval audit events bound to lifecycle hash-chain (25 November 2026)

- Code review found that RC-26 persisted approval issuance and consumption in the RC-11 `events` list, but did not include explicit approval event records in the RC-17 hash-chain. The chain only showed the resulting job transition, leaving issuance and one-use consumption less directly auditable.
- Added explicit `approval_issued` and `approval_consumed` chain events using a hashed approval identifier (no raw token). The verifier validates job/digest binding, issuer label, expiry, one-use semantics, and requires consumption to be immediately followed by the matching `pending` → `approved` transition.
- Lifecycle reads now cross-check the persisted approval records against the verified chain, including used-state, expiry, digest, approver and job ID. Unmatched approval records fail closed in the integrity result.
- The redactor now uses a null-prototype object to avoid special-key assignment behavior.
- Tests added/updated for approval issuance/consumption chain ordering, concurrent one-use, and detection of unlogged approval state. CI evidence is pending; no result is claimed until the workflow completes.
- No OIDC route integration, external WORM audit sink or runner execution was connected.


### RC-29 CI feedback — syntax correction required

- Run **45715459971 (#271)** failed the Node-test step: 97/102 passed, 5 test-file imports failed because the new hash constant was inserted with a literal escaped newline. Shell/Python, Compose and Caddy validation were skipped after the test step failed. This failure is retained and not counted as passing.
- Corrected the source separator on the isolated branch. Fresh CI is required to verify the correction; no pass is claimed yet.


### RC-29 CI closeout — verified

- The initial RC-29 code commit `e0cb76806328bc0528116f9de31abd8abb214a4a` failed runs **45715459971 (#271)** and **45715470523 (#272)**: 97/102 Node tests passed, with five import/syntax failures caused by a literal escaped newline in the module insertion.
- The intermediate correction commit `a886d64c58cd0be6d787d20671ac0b2fd67cb17c` also failed runs **45715556448 (#273)** and **45715569522 (#274)** because additional escaped newline artifacts remained.
- Corrected code commit `da9a0f7941c39afb1907267e797648fa45f6b7da` was verified by GitHub Actions **45715617333 (#275) — SUCCESS: 124/124 Node tests** and PR run **45715626427 (#276) — SUCCESS: 124/124 Node tests**. Both passed bootstrap shell syntax, backup/restore and Python extractor syntax, Compose validation, and Caddy validation.
- These failures are documented and not counted as passing. No RiverCloud services or runner were started. The Caddy validation used the workflow's temporary container only.


### RC-29 documentation accuracy follow-up

- Corrected the RC-13 OIDC proxy document: the OAuth2 Proxy image is already digest-pinned in Compose; signature verification, SBOM and full CVE scan remain outstanding.
- Corrected test-status notes in RC-13 identity, RC-5 runner boundary, RC-6 worker specification and RC-7 runtime scaffold to reflect verified CI #275/#276 and report-only #277/#278, without implying a runtime worker or authentication integration.
- Documentation-only update; fresh CI is pending.


## RC-30 — bounded queue and state-store size (25 November 2026)

- Audit found that the local queue and shared state file had no capacity guard; accepted plans and event arrays could grow without bound, and state reads had no file-size precheck.
- Added a fail-closed queue limit of 5,000 jobs/10,000 events and an 8 MiB state-file read cap. Duplicate submissions are still checked before the queue cap so idempotent retries remain successful.
- The API maps capacity/oversized-store errors to HTTP 503 with explicit safe error codes. No automatic pruning is introduced because deletion of audit/state history requires a retention design.
- Regression tests cover queue cap, HTTP 503 and oversized state file. CI evidence is pending.
- This is a prototype capacity guard; limits and retention must be revisited before real deployment.


### RC-30 CI feedback — syntax correction required

- Push run **45716181629 (#281)** and PR run **45716190031 (#282)** failed the Node-test step: 72/83 tests passed, 11 test-file imports failed due literal escaped newline artifacts in the inserted constants/imports. Subsequent shell/Python, Compose and Caddy validations were skipped.
- The correction replaces the literal escape sequences with actual source line breaks. The next CI run is required before RC-30 is considered verified.


### RC-30 — capacity guards: correction and verification status

- Retrieved CI run **45716334299 (#284)** for the pre-correction head. The Node test step failed at queue capacity and oversized state-file checks; the limits were documented but were not wired into the queue and state reader. The failure is not counted as passing.
- Implemented the queue item/event limits inside the state transaction, after the duplicate-digest check, so idempotent retries remain accepted even at capacity. New non-duplicate insertions fail with `queue_capacity_exceeded` when either 5,000 jobs or 10,000 events is reached.
- RC-11 now prechecks descriptor size and reads state in bounded chunks (8 MiB maximum); the transaction also checks serialized snapshot size before writing/renaming. Oversized read/write failures use `state_file_too_large`.
- Run **45716893463 (#292)** on commit `57828559ea8169915b76dbf494e31a1cdedb9894` failed one added idempotent-at-cap test because its fixture calculated the digest from the raw request instead of the canonical validated plan. This test defect was corrected to use `planDigest(validateDeployRequest(base))`; the failure remains documented and is not counted as passing.
- Correction commit **`e51f7d8c8f0a3e0dfd724faaaeff36a38e08a34c`** adds the corrected fixture and regressions for queue/event limits, duplicate retry at both limits, bounded state reads, and write-side size rejection. The RC-30 doc was updated in `73472949d0f2aa0b87b33ad12d950cc8ece3a2bd`.
- **Fresh CI evidence for the correction is pending.** No pass is claimed. The next verification must include the entire Node suite, shell/Python, Compose and Caddy checks.
- No production service, runner, staging host or live deployment was started. The work remains confined to PR #75's isolated branch.


### RC-30 CI closeout — verified

- GitHub Actions **45717007464 (#298) — SUCCESS: 130/130 Node tests, 0 failures**, plus bootstrap shell syntax, backup/restore and Python extractor syntax, Docker Compose configuration, and Caddy validation.
- Run #298 verifies commit **`4a08fa49caf752573a0e73789ab22644bcddebd4`**, which includes the RC-30 correction code `e51f7d8c8f0a3e0dfd724faaaeff36a38e08a34c` and the report update.
- The test suite verifies queue item/event caps, idempotent duplicate at both caps, bounded state reads, and write-side snapshot rejection. Earlier failures #281/#282, #284 and #292 remain documented and are not counted as passing.
- The Caddy check used a short-lived validation container only. No RiverCloud services, runner, staging host or production deployment were started.
- The later RC-30 closeout-doc commit `5391fb79ce231dd9b5f5d9d25dc150a5b7568180` still needs its own CI verification before the latest branch head is considered verified.

### RC-30 documentation closeout — verified

- GitHub Actions **45717083964 (#302) — SUCCESS: 130/130 Node tests, 0 failures**, plus bootstrap shell, backup/restore and Python extractor syntax, Compose configuration and Caddy validation.
- Run #302 verified report commit **`c3cb24593a76bf1dda41bc64a1d4cb0c3fbecbf9`**, including the preceding RC-30 closeout-doc commit. The source correction remains the one verified by #298.
- No RiverCloud services or runner were started. No merge, live deployment, provisioning or spending occurred.


### RC-31 — restore archive source integrity hardening (25 Nov 2026)

- Audited the restricted restore helper and found a preflight/extraction TOCTOU window: the archive path was opened twice, so checksum/preflight and extraction could reference different archive contents if the path changed.
- Changed the helper to open the archive once with `O_NOFOLLOW`, verify the descriptor is a regular file, and use the same file descriptor/TarFile instance for preflight and extraction. It fails closed if `O_NOFOLLOW` is unavailable.
- Added a regression test for a symlinked archive path after checksum verification; it must fail and leave the restore target absent.
- Added `RC31-RESTORE-SOURCE.md`. CI evidence for the new code/test is pending; no pass is claimed yet.
- No real backup or restore, production data access, deployment, server provisioning or spending was performed.


### RC-31 CI closeout — verified

- GitHub Actions **45717374680 (#314) — SUCCESS: 131/131 Node tests, 0 failures**, plus bootstrap shell syntax, backup/restore and Python extractor syntax, Compose config, and Caddy validation.
- Run #314 verified commit **`dd90f8b3e0772275cfb7266c3d1db6a38c143cde`**, including the single-descriptor restore correction and the symlink archive regression.
- The Caddy check used a temporary validation container; no RiverCloud service or runner was started. No production backup/restore, merge, deployment or spending occurred.
- RC-31 documentation closeout is committed separately and requires fresh CI verification before latest branch head is considered verified.


### RC-31 report closeout — verified

- GitHub Actions **45717458639 (#318) — SUCCESS: 131/131 Node tests, 0 failures**, plus bootstrap shell, backup/restore and Python extractor syntax, Compose configuration and Caddy validation.
- Run #318 verified report commit **`26f58738b2fc740cc30e31e5c665f817160e51bb`**, including RC-31 report/doc closeout. No RiverCloud services were started.


## RC-32 — restore target directory-descriptor isolation (26 November 2026)

- Audit found a path-based intermediate-directory TOCTOU in the restricted restore extractor: a directory checked before file creation could be replaced with a symlink before the subsequent pathname open.
- The extractor now requires directory-descriptor support, traverses nested directories using mkdir/open relative to open descriptors with O_DIRECTORY|O_NOFOLLOW, creates files relative to the verified parent descriptor with O_EXCL|O_NOFOLLOW, and syncs the relevant directory descriptors.
- Failure cleanup checks the target directory's device/inode before deleting it, avoiding cleanup of a replaced target pathname.
- Added a deterministic race-injection test that replaces the nested directory with a symlink immediately before the second file open. The descriptor-based code writes into the already-open directory, not the outside symlink target.
- Reconstructed local workspace: 1/1 regression passed. A negative-control run against the reconstructed legacy path-based extractor failed because it wrote through the replacement symlink. This is not a full repository checkout.
- GitHub Actions verification is pending. A clone/check-out attempt was blocked by DNS resolution of github.com; no test pass is claimed for a full checkout.
- No live services, runner, staging host, real backup/restore, merge, production deployment or spending occurred.


### RC-32 CI closeout — verified

- GitHub Actions run **45723627763 (#322) — SUCCESS: 131/131 Node tests, 0 failures**, plus shell/Python syntax, the new **1/1 directory-replacement race test**, Compose configuration and Caddy validation.
- Run #322 verified commit **245707bc0a0f869404d7aaa57b6b1467ec71bcb1**. The race regression is explicitly present as step 7 and passed. The Caddy validation used a temporary container; no RiverCloud service or runner was started.
- The report-only closeout commit requires a fresh CI verification before the latest branch head is considered verified.


## RC-33 — audit redactor special-key safety (26 November 2026)

- File-by-file review of RC-14 found that redaction copied untrusted object keys into an ordinary object. A JSON own-key named `__proto__` could alter the output object's prototype rather than being preserved as data, while special keys could be mishandled during serialization.
- The redactor now constructs copied objects with `Object.create(null)`, preserving special keys as own data properties without mutating `Object.prototype`.
- Added a regression for `__proto__`, `constructor`, and `prototype`, nested secret redaction, canonical envelope verification, and an explicit check that `Object.prototype` remains untouched.
- Reconstructed temporary workspace using Node **22.16.0**: **13/13 RC-14 audit-sink tests passed**. This is a focused local test, not a full repository checkout.
- GitHub Actions verification of the branch increment is pending; no CI pass is claimed for RC-33 yet.
- No audit delivery, network receiver, RiverCloud service, runner, backup/restore, production operation or spending was performed.


### RC-33 CI closeout — verified

- GitHub Actions **run 45729220577 (#329) — SUCCESS: 132/132 Node tests, 0 failures**, plus bootstrap shell syntax, backup/restore and Python extractor syntax, the 1/1 directory-replacement race regression, Compose validation, and Caddy validation.
- Run #329 checked report commit **aafd7f0523f06182941cc45bc04b0d535ab3b082**, including the RC-33 source/test increment and the initial pending-evidence note.
- The Caddy validation used a temporary pinned-image container only. No RiverCloud service, runner, audit receiver, backup/restore operation or staging host was started.


## RC-34 — proxy identity/API authorization prototype (26 November 2026)

- Added a separate API prototype that accepts OIDC Proxy identity headers only from the configured trusted source IP (default `172.30.250.3`), maps provider group names to RC-13 roles, and enforces route permissions.
- Routes: `GET /api/health` and `GET /api/jobs` require `read_status`; `POST /api/plan` requires `manage_projects`. The plan endpoint is queue-only; execution is disabled.
- Added tests for source-IP rejection, missing/unmapped identity, viewer/operator RBAC, idempotent plan submission, method/content-type/body bounds.
- RC-13 policy now grants status-read to admin, operator and auditor roles without adding project-management/audit permissions to viewer or auditor.
- **CI verification pending for this increment.** No full local checkout was available: `git clone` failed because DNS could not resolve github.com. The branch changes will be verified by GitHub Actions; no local test result is claimed.
- The prototype is not connected to Compose or OAuth2 Proxy. No real OIDC authentication, API route integration, runner, staging, production operation or spending occurred.


### RC-34 CI closeout — verified

- GitHub Actions **run 45735325864 (#333) — SUCCESS: 138/138 Node tests**, zero failures, plus bootstrap shell syntax, backup/restore and Python extractor syntax, the 1/1 directory-replacement race test, Compose configuration, and Caddy validation.
- The log explicitly records **138 passed, 0 failed** and the RC-34 tests at 116–120. No services were started.
- Run #333 verifies commit `e2dbdbbca5556c215307c81ed23d3c005bdecd85`. The API prototype remains unconnected to Compose/OAuth2 Proxy; this is test evidence for the isolated module, not real OIDC authentication or production readiness.
- Local checkout remains unavailable due DNS resolution of github.com; no local test result is claimed.



## RC-35 — API/OIDC Compose wiring prototype (26 November 2026)

- Connected the RC-34 API prototype to the Compose topology using a dedicated internal network. Caddy remains on the public network; OAuth2 Proxy bridges the public and internal networks; API and demo upstream are not reachable from Caddy directly.
- OAuth2 Proxy upstream mapping now routes `/api/` to the API and root-path traffic to the demo. Group allowlist examples include the five RC-13 roles; actual provider group names must be verified.
- API has no host-published port, uses a named state volume, read-only root, non-root Node user, dropped capabilities, no-new-privileges, and declared CPU/memory bounds. The Dockerfile copies only required API modules and uses a digest-pinned Node base.
- Added static Node regressions for network topology, proxy path/header configuration, API bind/trusted proxy IP, storage and runtime restrictions, Dockerfile digest and explicit file copies. CI evidence is pending; no test result is claimed for RC-35 until a fresh run completes.
- Compose configuration validation does not build or start the API image. No real OIDC login, header-spoofing integration test, session revocation test, container build, service startup, staging, deployment or spending occurred.
- Source reference for OAuth2 Proxy path-based multi-upstream routing: https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/#upstreams-configuration. Node base digest reference: https://hub.docker.com/layers/library/node/22.23.5-alpine3.23/images/sha256-7ee381e2296c8edb56698bb4f14563880e8c3562d91564c085b334c1e1106faf.



### RC-35 CI closeout — verified

- GitHub Actions run **45743142427 (#337) — SUCCESS: 145/145 Node tests**, 0 failures; bootstrap shell syntax, backup/restore and Python syntax, **1/1 restore directory-replacement race test**, Docker Compose configuration, and Caddy validation also passed.
- Run #337 verifies commit **cb91b7f9db268c9ef53c255903b6f51a7a84d3a5**. The static RC-35 tests are numbered 124–127 and passed. The workflow only ran Compose `config` and Caddy validation; it did not build the API image or start RiverCloud services.
- No real OIDC provider login, proxy/API traffic, header-spoofing runtime test, container build, runner, staging, production deployment, real backup/restore, or spending occurred.



## RC-36 — provisional authenticated queue attribution (26 November 2026)

- RC-34 API submission previously enforced proxy identity/RBAC but did not persist who submitted a queue plan. Added a domain-separated SHA-256 actor reference and mapped-role snapshot to new API-created queue jobs and their transactional `job_created` event.
- Queue validates the actor-reference format and role vocabulary. Idempotent retries preserve the original attribution and never overwrite it with a later caller.
- Added tests for pseudonymous attribution, role snapshot, duplicate preservation, and malformed actor contexts. CI evidence is pending.
- This is provisional attribution only: unkeyed SHA-256 of a proxy-supplied user label is not anonymization, issuer/sub binding, authentication proof or protected immutable audit. Legacy queue callers remain unattributed. RC-17 lifecycle migration and external protected audit remain blockers.


### RC-36 CI closeout — verified

- GitHub Actions run **45743359921 (#340) — SUCCESS: 147/147 Node tests**, 0 failures, including the actor-attribution and malformed-context regressions.
- Run #340 also passed bootstrap shell syntax, backup/restore and Python syntax, the **1/1 restore directory-replacement race test**, Docker Compose configuration, and Caddy validation. It verifies commit **f31985e3b1a4d25fd078faccd665a2da21dbe711**.
- The attribution remains provisional and pseudonymous; it is not issuer+subject authentication or an immutable audit record. No service was started or API integration request made.
\n\n### RC-37 — separate job-list permission from generic status (26 November 2026)\n\n- Audit found `GET /api/jobs` was using `read_status`, which granted full persisted job/plan details to Viewer and Auditor roles. This was broader than a status-read permission.\n- Added explicit `read_jobs` to the RC-13 permission catalog and grant it only to owner/admin/operator; Auditor and Viewer now fail closed on the queue endpoint.\n- The health response no longer echoes the raw proxy username.\n- Regression tests cover Viewer/Auditor denial, Operator/Admin access, and health-only status access.\n- **Previous code head evidence:** GitHub Actions run **45743430386 (#343) — SUCCESS: 147/147 Node tests**, 0 failures; shell/Python, 1/1 restore directory-replacement race test, Compose and Caddy validation also passed for commit `da0203408557de14a4ba43e0d44ed6c723ae1e29`.\n- RC-37 changes are committed on the isolated branch; CI for the new commit is pending. No real OIDC login or live proxy/API integration was exercised.\n\n

### RC-37 CI regression and correction

- The first RC-37 commit failed both Push run **45751777462 (#344)** and PR run **45751783317 (#345)**: the new Admin test was inserted with literal escaped newline sequences, causing a JavaScript syntax error in the RC-34 test file. The test job stopped before the remaining validation steps; the 142/143 count is not a successful suite.
- Corrected the test block to contain real line breaks. The correction is isolated on the same feature branch; CI evidence for the corrected commit is pending.
- The finding itself remains: generic status-read access must not expose full queue/job details.


### RC-37 CI regression and second correction

- Corrected run **45751858304 (#346) — FAILURE**: the malformed test insertion was fixed, but the old Viewer test still expected `GET /api/jobs` to return 200. The new policy correctly returned 403; the stale assertion failed (147/148), so the workflow stopped before later validations.
- Updated that test to reflect the new role boundary: Viewer and Auditor may read health/status but not full job details; Viewer cannot submit plans. The health response must not echo the actor label. The corrected commit's CI is pending.

### RC-38 — preliminary image-version advisory review (26 November 2026)

- **Node base:** Dockerfile pins Node `22.23.5-alpine3.23`. The official Node 22.23.5 security release (11 November 2026) includes security fixes; the pinned upstream version is newer than the 22.23.4 fix for CVE-2026-111497. Version-level review only; exact Alpine package/image scan was not run.
- **Caddy:** pinned image is `2.11.9`. A version-level advisory result lists Caddy versions below 2.11.9-r0 as affected by CVE-2026-111943. The exact container package inventory and fix status were not verified by a scanner.
- **OAuth2 Proxy:** pinned `v7.15.6`; the upstream release notes dated 5 November 2026 list security fixes. The v7.15.2 release also fixed multiple configuration-dependent authentication bypasses. This is not an image scan or proof that every embedded dependency is free of CVEs.
- All three image references are digest-pinned in Compose/Dockerfile. **No SBOM, image signature verification or full vulnerability scan has been produced.** The demo `whoami` image is also not scanned.
- Sources reviewed: Node release https://nodejs.org/en/blog/release/v22.23.5 ; OAuth2 Proxy release https://github.com/oauth2-proxy/oauth2-proxy/releases ; Caddy version-level advisory search https://security.snyk.io/vuln/SNYK-MINIMOSLATEST-CADDY-22514111 .


### RC-37/RC-38 CI closeout — verified 26 November 2026

- Push run **45751948706 (#348) — SUCCESS: 148/148 Node tests**, 0 failures. PR run **45751952030 (#349) — SUCCESS: 148/148 Node tests**, 0 failures.
- Both runs also passed bootstrap shell syntax, backup/restore and Python syntax, **1/1 restore directory-replacement race test**, Compose configuration, and Caddy validation. No RiverCloud services were started.
- The corrected RBAC test now proves Viewer and Auditor are denied full queue details; Operator and Admin have the explicit `read_jobs` grant, while health/status does not echo the actor label.
- RC-38 is only a preliminary version/advisory review. SBOMs, exact-image scans, signature verification and a full CVE assessment remain pending.


### Report snapshot correction

GitHub PR metadata confirms **98 changed files** at the current branch head. The count was corrected from 96 after adding RC-37 and RC-38 documentation. The report-count correction was verified by GitHub Actions runs #352 and #353 — SUCCESS, 148/148 tests each, plus all shell/Python, restore race, Compose and Caddy validations.


### RC-38 report-count correction CI closeout

- GitHub Actions push run **45752079082 (#352)** and PR run **45752083124 (#353)** — SUCCESS, **148/148 Node tests** each, 0 failures, plus bootstrap shell, backup/restore and Python syntax, **1/1 restore directory-replacement race**, Compose configuration and Caddy validation. These runs verify the report count correction commit `b52977df3e2eb12316bfdecb16c5e8b06c55a678`.


## RC-39 — API image build verification (26 November 2026)

- Added a CI build of the isolated API image using the explicit Dockerfile and repository-root context, followed by inspection of the resulting image ID.
- GitHub Actions push run **45757060159 (#356)** and PR run **45757064289 (#357)** — SUCCESS, **148/148 Node tests**, zero failures, plus shell/Python syntax, **1/1 restore directory-replacement race**, Compose configuration, API image build and image inspection, and Caddy validation.
- This proves the Dockerfile builds in CI; no API container or Compose service was started. It is not an SBOM or vulnerability scan.
- Static audit of the runner/worker entry points confirms execution remains disabled; no runner was started.


## RC-40 — Docker build-context exclusions verified (26 November 2026)

- Root `.dockerignore` excludes repository metadata, environment files, secret directories, queue/lifecycle state, locks, temporary files, logs, backups, archives and common build artifacts from the API image build context.
- Regression test checks the required patterns; line parsing normalizes LF and whitespace.
- GitHub Actions **push run 45757386114 (#364)** and **PR run 45757391345 (#365)** — SUCCESS, **149/149 Node tests**, zero failures, plus bootstrap/backup/restore/Python syntax, **1/1 restore directory-replacement race**, Compose configuration, API image build and image inspection, and Caddy validation.
- The test fixture corrections were recorded: runs #358/#359 and #360/#361 failed in the new test (not the `.dockerignore`), then #362/#363 succeeded with 149/149. These failed runs are not counted as passes.
- The Docker build was validated; no API container or Compose service was started. No real secrets or runtime data were accessed.

## Read-only repository governance observation

- GitHub branch metadata reports `main` as **not protected** (`protected: false`) at read time. No branch settings were changed. Branch protection and required checks should be configured before any future merge; this PR remains Draft and no merge is authorized.


### RC-40 test correction (26 November 2026)

- CI runs **45757190923 (#358)** and **45757195384 (#359)** failed at Node test 27: the test's escaped newline splitter did not split the `.dockerignore` lines, so it reported the first required pattern missing. The other 148 tests passed; subsequent validation steps were skipped.
- Corrected the regression test to split on the literal newline. The `.dockerignore` file itself was not the failure. Fresh CI verification is pending; these failures are recorded, not counted as passes.


### RC-40 test corrections (26 November 2026)

- Runs **45757190923 (#358)** and **45757195384 (#359)** failed because the regression test's escaped newline splitter did not split `.dockerignore` lines (148/149 passed); the implementation file was not the failure.
- Runs **45757276500 (#360)** and **45757283045 (#361)** failed on the same test after the first correction; the line comparison was not robust to whitespace/line-ending normalization. The test is now changed to split on LF and trim each line before matching. These failures are recorded, not counted as passes. Fresh CI is pending.


## RC-45 — lifecycle approval gate (26 November 2026)

- Static audit found that the generic RC-17/RC-9 transition API could set a job from `pending` to `approved` without consuming a one-use approval token. The atomic approval-consumption helper existed, but the generic transition route was a bypass.
- The generic transition map now excludes `pending -> approved`; the API returns `approval_required` for a direct attempt. The legacy facade mirrors this restriction.
- Audit replay now accepts the `approved` transition only when immediately preceded by the matching, audited approval-consumption event (same job, consumer actor and required note). A manually fabricated approval transition with a recomputed unkeyed hash is rejected.
- Regression tests cover the generic gate, tampered/recomputed audit replay, legacy facade, concurrency, and the approval-consumption path's integrity. Tests were amended to use rejection for generic transition cases and to exercise approval through the atomic approval helper.
- **CI for the RC-45 code commits has not yet been independently confirmed at this report update.** Local clone/test execution remains unavailable due the earlier GitHub DNS restriction; no local test pass is claimed.
- No OIDC provider login, route wiring, runner execution, staging host, live deployment, production data/credentials, provisioning, merge or spending occurred.
- Remaining boundaries: identity claims are not cryptographically verified at API integration; external audit sink, runner isolation, staging, encrypted off-site backups, SBOM and exact-digest vulnerability scans remain open.


## RC-45 CI closeout (26 November 2026)

- Intermediate runs **45765623540 (#382)** and **45765631060 (#385)** failed as the new gate was introduced: the existing approval/facade tests still attempted generic `pending -> approved`. The failures were not counted as passing evidence; assertions and fixture transitions were corrected.
- Code/test commit `be13c9eff5373f13eb8f2a040608f2af462ff01f`: GitHub Actions **45765635507 (#387) — SUCCESS, 152/152 Node tests**, 0 failures; bootstrap shell, backup/restore and Python syntax, restore directory-replacement race, Compose configuration, API image build/inspection and Caddy validation all passed.
- Documentation closeout commit `370f06a9a292b45911a1859f28d3a84edea2f25f`: GitHub Actions **45765687287 (#392) — SUCCESS** across Node tests, bootstrap shell, backup/restore/Python, restore race, Compose, API image build/inspection and Caddy validation. Exact Node count was not independently extracted from this run's logs; the count above is from #387.
- No RiverCloud services or runner were started. No live deployment, merge, staging host, production credentials/data, provisioning or spending occurred.


## RC-46 — queue events / audit ledger storage separation (26 November 2026)

- Audit of `queue.mjs` and `audit-log.mjs` found a shared-field collision: queue and lifecycle-related events use `state.events`, while the standalone RC-8 hash-chained ledger also treated `state.events` as its ledger. A queue-created event could therefore invalidate audit-ledger replay and the two stores were not safely composable.
- The RC-8 ledger now uses a dedicated `state.auditLogRecords` field. Queue/event records remain in `state.events`; the audit ledger is independently verified and bounded to 10,000 records.
- Tests added for queue+audit coexistence and independent ledger capacity, alongside redaction, concurrent append ordering and tamper detection.
- **CI pending for RC-46 at this report update.** Local test execution is not claimed.
- No services or runner started, no real staging, deployment, production data/credentials, merge, provisioning or spending.


## RC-46 CI closeout (26 November 2026)

- Code/test commit `3348c1e26166d7034ab00fc78cb7bae05683b0b6`: GitHub Actions **45765929407 (#401) — SUCCESS, 154/154 Node tests**, 0 failures; bootstrap shell, backup/restore and Python syntax, restore directory-replacement race, Compose, API image build/inspection and Caddy validation all passed.
- Report/document closeout commit `15d30cdd20661315d42602792977c7512c859ddf`: GitHub Actions **45765947186 (#404) — SUCCESS, 154/154 tests**, plus the same shell/Python, restore race, Compose, API image build/inspection and Caddy validation suite.
- No RiverCloud services or runner were started; no real deployment, merge, provisioning, production data/credentials or spending.


## RC-47 — backup preflight for active state transactions (26 November 2026)

- Static audit of RC-19 found the backup script silently excluded `*.lock` and `*.tmp-*` files without checking whether a transaction was in progress. The documentation required quiescing, but the script did not fail closed.
- Added a preflight refusal if the data directory contains a transaction lock or temporary snapshot file. Tests cover both marker types. The preflight is a detection aid only; it does not atomically lock the store and the operator must still quiesce the writer.
- **CI pending for RC-47.** No local test pass is claimed.
- No real backup, restore, staging, services, runner, deployment, merge, production data/credentials, provisioning or spending.


## RC-47 CI closeout (26 November 2026)

- Code/test commit `5d4132937689260827e736f7cff6346c57a048fe`: GitHub Actions **45766205553 (#412) — SUCCESS, 155/155 Node tests**, 0 failures; bootstrap shell, backup/restore/Python syntax, restore directory-replacement race, Compose, API image build/inspection and Caddy validation passed.
- Report/document closeout commit `8b11279c780eb6ea8a1ab3f3600ae0fcc599f14c`: GitHub Actions **45766244589 (#417) — SUCCESS, 155/155 Node tests**, plus the same validation suite.
- No real backup or restore was performed. No services or runner were started, no merge, deployment, production data/credentials, provisioning or spending.


## RC-48 — canonical backup path containment (26 November 2026)

- Follow-up audit found that RC-19 used logical `pwd` paths for source and backup directories. A symlink alias could make a backup destination physically inside the data directory appear outside during the containment check.
- The backup script now resolves both directories with `pwd -P` before containment comparison. A regression test supplies a source-directory symlink alias and a backup destination inside the physical source, and requires refusal.
- **CI pending for RC-48.** No local test pass claimed.
- No backup/restore operation, services, runner, staging, deployment, merge, production data/credentials, provisioning or spending.


## RC-48 CI closeout (26 November 2026)

- Code/test commit `7ebbabbae101c1d39e98d59a117c64078202ce6a`: GitHub Actions **45766399053 (#423) — SUCCESS, 156/156 Node tests**, 0 failures; bootstrap shell, backup/restore/Python syntax, restore directory-replacement race, Compose, API image build/inspection and Caddy validation passed.
- No real backup or restore was performed. No services or runner were started, no merge, deployment, production data/credentials, provisioning or spending.


## RC-52 — post-mutation snapshot validation (26 November 2026)

- The RC-11 transaction store now revalidates the snapshot after the mutator and before serialization/commit, preventing invalid collection/schema mutations from being persisted.
- Regression tests exercise schema and collection-shape mutations and verify the original snapshot remains intact when validation rejects them.
- Code commit `cc1475632e75985f266111db11969e913339d43f`; test commit `b4818b9521f292d7fc6625382781c93ca37b111a`.
- CI evidence for this exact head was not independently retrieved at this report update; no local checkout test run is claimed.

## RC-53 — fail-closed lifecycle extension state and capacity (26 November 2026)

- Review of RC-17 found that malformed optional lifecycle/audit collections could be silently reinitialized as empty arrays, risking concealment or replacement of damaged data. RC-17 now initializes only absent collections and rejects existing non-array values; reads return explicit invalid-integrity reasons instead of presenting damaged extension state as empty/valid.
- Added hard bounds: 5,000 lifecycle jobs, 10,000 atomic audit records, 10,000 approvals and 10,000 lifecycle approval events. Batch audit append checks its full requested size before mutation; approval issuance/consumption fail closed when the event collection is full.
- Added regression tests for damaged lifecycle/audit collection preservation, fail-closed reads/mutations, and capacity rejection, including approval-event capacity.
- Code commit `09fe41e5bb4c9f39e5c9802089bae8b30063df29`; test commit `ac68ac92f588907662871aa4049869697f4d6ca0`.
- **CI pending for RC-53;** the commits were confirmed on the isolated PR branch, but tests have not been independently executed in this run.
- No runner or service was started, no merge/deployment/staging operation, real data/credentials, provisioning or spending occurred.


### RC-53 CI closeout (26 November 2026)

- Intermediate workflow **45768639404 (#451) — FAILURE, 163/165 Node tests**: the two newly added RC-53 regression tests failed on the test-only commit before the corresponding fail-closed/capacity implementation landed. This failure is recorded, not counted as a pass.
- Code commit `09fe41e5bb4c9f39e5c9802089bae8b30063df29`: workflow **45768665982 (#453) — SUCCESS, 165/165 Node tests**. Bootstrap shell, backup/restore and Python syntax, restore directory-replacement race, Compose configuration, isolated API image build/inspection and Caddy validation also passed. No RiverCloud services were started.
- Report commit `c199a0c6508d9b6506758c0c5a2d149d27cbd86e`: workflow **45768696371 (#455) — SUCCESS, 165/165 tests**, plus all validation steps above.
- Latest roadmap/report branch commit `13d579ea3a9c909df72d6e7ef7e0b50cb0db46b9`: workflow **45768708467 (#456) — SUCCESS, 165/165 tests**, plus bootstrap, backup/restore/Python, restore race, Compose, API image build/inspection and Caddy validation.
- This CI evidence validates the isolated code and regression tests, not actual RiverCloud operation, OIDC provider integration, real runner execution, staging, backup to external storage, or production readiness.


## RC-54 — proxy API local trust-peer default alignment (26 November 2026)

- File review found the standalone RC-34 API default trusted peer was a stale public-network IP `172.30.250.3`, while Compose assigns the proxy `172.31.250.3` on the private API network.
- Corrected the default peer to `172.31.250.3`; added a local-caller fail-closed regression and static checks that the API default and Compose override match. This does not prove real proxy header behavior.
- Code commit `01cb33a9bc2734f03890065dccb579ec75015709`; test commits `099bf4801ca81410631c4e703fb82fb8b91b01bc` and `0cff59e1ce9e76018ed34a514c87fba7fae260e0`; documentation commit `c37bc47c9fbfc19349043d715d318909e453b499`.
- Intermediate runs **45768905119 (#461, 165/166)** and **45768950548 (#468, 166/167)** failed on the first loopback-default attempt: a direct local caller was incorrectly treated as the trusted peer. The implementation was corrected to trust the private network address, and these failures are not counted as passes.
- Latest workflow **45769108597 (#479) — SUCCESS, 168/168 Node tests**, plus bootstrap shell, backup/restore and Python syntax, restore-directory race, Compose configuration, isolated API image build/inspection and Caddy validation. No RiverCloud services were started.
- No live OIDC/provider request, runner, staging, production data/credentials, merge, deployment, provisioning or spending.


### RC-53 event-cap follow-up

- Added a separate regression that fills `state.events` to its configured 10,000-record limit and requires approval issuance to reject rather than append. The lifecycle helpers also fail closed when the event collection is at capacity during approval consumption.
- The test is included in latest run **45769108597 (#479) — SUCCESS, 168/168**.


### RC-54 report closeout

- Report commit `fc117c74c34f7146f9566f0391ee534253c8b7cf`: workflow **45769186772 (#481) — SUCCESS, 168/168 tests**, plus bootstrap, backup/restore/Python syntax, restore-race, Compose, API image build/inspection and Caddy validation.

## RC-55 — audit-envelope redaction enforcement (26 November 2026)

- Review of RC-14 found `verifyAuditEnvelope` checked integrity but did not require the data to be redacted. A manually assembled envelope could include sensitive-key values and still pass the envelope verifier if its unkeyed hash were recomputed; signed delivery would then transmit it.
- The verifier now re-applies the canonical redactor and rejects data that is not already redacted (`data_not_redacted`), before digest verification. Added a regression that injects a raw secret, recomputes the envelope hash, and requires rejection.
- Code commit `f9588979a4becc10bcae88b6e2e28814d0f856b8`; test commit `99c45ebdef0593ec072db974f94ab80203f3c07d`.
- **CI pending for RC-55.** No network delivery, receiver, real audit sink, external storage, live service, runner, staging, production data/credentials, merge, deployment, provisioning or spending.


### RC-55 CI closeout (26 November 2026)

- Test commit `99c45ebdef0593ec072db974f94ab80203f3c07d`: GitHub Actions **45769271258 (#485) — SUCCESS, 169/169 Node tests**, plus bootstrap shell, backup/restore and Python syntax, restore-directory race, Compose configuration, isolated API image build/inspection and Caddy validation.
- Report commit `4c5b6e86e8f510c964e716cc5197b4feb76a1a48`: workflow **45769293314 (#487) — SUCCESS, 169/169 tests**, plus the same validation steps.
- The test verifies that an envelope containing a raw sensitive-key value is rejected even if the unkeyed envelope hash is recomputed. This protects against accidentally signed-but-unredacted payloads in this verifier prototype; it is not independent immutable audit storage or real network delivery.


## RC-56 — audit ledger read integrity and special-key safety (26 November 2026)

- Review of RC-8 found `readLedger` returned persisted records without verifying the hash chain, and its redactor used ordinary-object assignment for `__proto__`, which could silently drop that key. The verifier also did not reject unredacted sensitive details when a record hash was recomputed.
- `readLedger` now verifies the persisted ledger and fails closed on integrity errors. Redaction uses null-prototype objects, preserves special keys safely, and the verifier rejects data that is not already redacted.
- Added tests for persisted-chain tampering, unredacted sensitive fields with recomputed hashes, special-key preservation, and read fail-closed behavior.
- Code commit `a4854ca0a93fbde986ed9298670c198c28572cdd`; test commit `aafe752614e0eef5e84a77c719ee47ed945a1011`.
- **CI pending for RC-56.** No external audit sink delivery, immutable storage, network operation, service, runner, staging, production data/credentials, merge, deployment, provisioning or spending.


### RC-56 test correction status

- Workflow **45769413800 (#491) failed 168/169** on the implementation-only commit because the existing capacity test still expected `readLedger` to return malformed records; the assertion was changed to require fail-closed read behavior.
- Workflow **45769429794 (#493) failed 171/172** because the special-key regression checked the prototype after JSON persistence, where parsing restores ordinary prototypes. The test was corrected to check the append-time redactor result and persisted key/redaction preservation.
- Corrected test commit `9d2402b42c7152e8745eb71ff329ed1effed100b`. **Fresh CI evidence for this corrected test commit has not yet been retrieved; no pass is claimed.**


### RC-56 CI closeout (26 November 2026)

- The corrected report/branch commit `c3cb99f92e873e0db1ac34c4a3a9a131503ec0c9` was verified by GitHub Actions **45769517850 (#499) — SUCCESS, 172/172 Node tests**, plus bootstrap shell, backup/restore and Python syntax, restore-directory race, Compose configuration, isolated API image build/inspection and Caddy validation.
- This run includes the corrected special-key regression, persisted-ledger verification, and rejection of unredacted sensitive details. The earlier failures #491/#493 are recorded above and not counted as passes.


## RC-57/RC-58 progression (26 November 2026)

- RC-57 bounds persisted audit-ledger verification to 10,000 records before replay; the regression rejects an oversized array. GitHub Actions **45769667056 and 45769663785 — SUCCESS** for RC-57 commit `d09d1c25307abcabab303d132a809bafe5662b3c`.
- RC-58 extends fail-closed state validation to optional persisted arrays `auditLogRecords` (10,000), `lifecycleJobs` (5,000), and `approvalEvents` (10,000). Oversized arrays reject reads and transactions before commit; malformed extension schemas continue to be rejected by their dedicated consumers, preserving existing fail-closed behavior. Regression tests cover over-capacity persisted arrays and malformed extension collections.
- RC-58 CI verification pending; do not count this increment as verified until workflows pass.
- No merge, deployment, production cutover, service startup, provisioning, credentials/data changes, or spending.


## RC-59 — strict audit-delivery header structure (26 November 2026)

- The signed-delivery verifier now rejects malformed header containers (null, array, primitive) and requires timestamp, nonce, and signature to be own-properties rather than inherited values.
- Regression coverage exercises malformed container types and inherited critical headers.
- Correction history: early test commits had a syntax newline issue and failed CI; corrected test syntax was committed. The corrected code/test head `f9f61e6f9feeaa5e4cc69b95544690f615c50fad` was verified by push run **45772818189 — SUCCESS** and PR run **45772826123 — SUCCESS**, including Node tests and bootstrap, backup/restore/Python, restore race, Compose, isolated API image build/inspection and Caddy validation.
- This prototype still makes no network calls; endpoint DNS/IP restrictions, authenticated sink operation and immutable storage remain unresolved. No services, merge, live deployment, production data/credentials, provisioning or spending.


## RC-60 — audit append rejects invalid details containers (26 November 2026)

- File-by-file review found `appendAudit` accepted `null`, arrays, primitives and non-plain objects for `details`. The ledger verifier rejects these as malformed record details, so a single append could persist a record that makes subsequent `readLedger` fail closed.
- Added pre-transaction validation: `details` must be a plain object or null-prototype object; invalid inputs reject with `invalid_audit_details` before state mutation.
- Added regression coverage for `null`, array, string, number and `Date` inputs and checks that the ledger remains absent/empty after rejection.
- Code commit `1081cfeb22147158998b1f651a3f672c86818edb`; test commit `d4b7be603fe7094445dbd88a3a1a6d7ebfe297e1`.
- **CI pending;** no test execution is claimed for this RC yet.
- No live services, runner, staging, merge, deployment, production data/credentials, provisioning or spending.


## RC-61 — restore target-parent directory descriptor isolation (26 November 2026)

- Audit found the restore target's parent path was still resolved by path-based `mkdir/open`, leaving a race if an intermediate parent directory were replaced by a symlink after the target directory was created.
- The extractor now opens and walks the absolute target-parent path component-by-component with `O_DIRECTORY|O_NOFOLLOW`, checks and creates the target by name relative to the held parent descriptor, and uses descriptor-based cleanup of owned target contents. Symlinked parent components are rejected.
- Added deterministic race coverage for parent-path replacement and a test for rejecting a pre-existing symlinked parent. The original nested-target race regression remains.
- Early CI runs **45778908239 (#624)** and **45778930875 (#626)** failed on the implementation/test commits with `Bad file descriptor`; **45778949343 (#628)** failed for the same issue. Audit of the failure identified variable reuse between the held target-parent descriptor and the per-file parent descriptor. The scope was corrected in commit `2b07562e99f6959a74d089244e579c136a4b6346`.
- Latest race-test commit `d1674535f5a3a0f621ad38b14f625625f136ee89`; **fresh CI verification pending**. No pass is claimed for RC-61 yet.
- No restore against RiverSpend data, service, runner, staging, merge, deployment, production data/credentials, provisioning or spending.


### RC-61 CI closeout (26 November 2026)

- Corrected code commit `2b07562e99f6959a74d089244e579c136a4b6346`: GitHub Actions **45779015477 (#632) — SUCCESS, 195/195 Node tests**, 0 failures; Python restore race check **2/2** passed along with bootstrap shell, backup/restore and Python syntax, Compose configuration, isolated API image build/inspection and Caddy validation.
- Latest regression-test commit `d1674535f5a3a0f621ad38b14f625625f136ee89`: GitHub Actions **45779060031 (#636) — SUCCESS, 195/195 Node tests**, 0 failures; restore race check **3/3** passed, including parent-path replacement and symlink-parent refusal. The same infrastructure validation steps passed.
- Failures #624, #626 and #628 were caused by a descriptor-scope bug in the first implementation; they are recorded and not counted as passes. The correction and subsequent CI evidence are above.
- No restore operation against real data was performed; no RiverCloud service or runner started, no merge, live deployment, production data/credentials, provisioning or spending.


### RC-60 CI closeout (26 November 2026)

- Code commit `1081cfeb22147158998b1f651a3f672c86818edb`: GitHub Actions **45778681439 (#617) — SUCCESS, 194/194 Node tests**, 0 failures, plus bootstrap shell, backup/restore and Python syntax, restore race, Compose, API image build/inspection and Caddy validation.
- Regression test commit `d4b7be603fe7094445dbd88a3a1a6d7ebfe297e1`: GitHub Actions **45778690767 (#619) — SUCCESS, 195/195 Node tests**, 0 failures, with the same infrastructure validation steps.
- Report commit `38154c06bd507894534fd826e665dfbb8258e9a8`: GitHub Actions **45778724537 (#621) — SUCCESS, 195/195 Node tests**, plus the same validations. Invalid audit details are rejected before persistence; no ledger corruption occurred in the regression.


## RC-62 — state-store privacy preflight (26 November 2026)

- Review found RC-11 relied on requested mode 0700/0600 but did not verify the permissions or ownership of an already-existing store directory or snapshot. An existing permissive directory/file could therefore bypass those intended privacy defaults.
- Transactions now require the final store directory to be a real directory owned by the current user with no group/world permission bits; state reads reject snapshots with unsafe ownership or permissions. Symlinked store directories fail closed. New snapshots and locks retain private mode 0600.
- The API image now initializes `/data` as node-owned and mode 0700. No automatic chmod/chown of existing state is performed.
- Regression tests cover symlinked store directories, unsafe directory permissions, unsafe snapshot permissions and private snapshot mode. Fresh CI evidence is pending; no local checkout test run is claimed.
- Existing named volumes that fail preflight require a reviewed, offline permission/ownership repair. No service, real data, deployment, merge, credentials, provisioning or spending was touched.


### RC-62 fixture correction (26 November 2026)

- Initial PR workflow **45781519481 (#672) failed 5/219 tests** because several pre-existing state-store test fixtures were created with the default 0644 file mode. The new privacy gate correctly rejected those fixtures before their intended schema/size/capacity assertions.
- The implementation is not relaxed. The test fixtures are being updated to create private-mode snapshots (0600) except the dedicated permission-rejection regression. A fresh CI pass is required before closeout.
