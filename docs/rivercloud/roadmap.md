# RiverCloud roadmap

## RC-1 — Core scaffold
Docker Compose, proxy and bootstrap.

## RC-2 — Domain routing and HTTPS
Caddy routing to an example service, automatic TLS for configured domain.

## RC-3 — Secure deployment pipeline
Security requirements, policy validator and loopback-only local queue API prototype delivered. Queue persistence exists; runner, webhook, isolated builds, audit logs, health checks and rollback remain pending.

## RC-4 — RiverCloud Panel
Static panel scaffold delivered; authenticated control plane, API, deployment actions and real metrics remain unimplemented.

## RC-5 — Operations
Backup/restore testing, monitoring/alerts, firewall, update strategy, capacity planning.

## RC-6 — Migration readiness
Run RiverSpend in staging on RiverCloud, validate reliability, backups, secrets, performance and rollback. Only then consider production cutover.


## Current isolated hardening campaign — PR #75

- Branch: `feat/rivercloud-core-2026-11-25` (Draft; no merge or live deployment).
- RC-52 through RC-59: transaction, lifecycle state capacity, proxy trust-peer alignment, audit redaction/verification and delivery header hardening; see the progressive report for exact CI evidence and limitations.
- RC-60: audit append now rejects non-object/non-plain details before transaction to avoid persisting verifier-invalid records; CI verified at 194/194 (#617), 195/195 (#619), and report closeout 195/195 (#621).
- RC-61: restore target-parent traversal/create/cleanup uses directory descriptors and rejects symlinked parent components; CI verified at 195/195 Node tests and 3/3 restore race checks after recording and correcting descriptor-scope failures.
- Progressive technical evidence and blockers are recorded in `infra/rivercloud/AUDIT-HARDENING-2026-11-25.md`.
- These RCs are code/test increments, not a production readiness certification. OIDC-provider operation, real runner, external audit sink, staging and production readiness remain unverified.

- RC-62: RC-11 now fails closed on final state-directory symlinks/ownership/permissions and unsafe snapshot ownership/permissions; the API image initializes `/data` at mode 0700. GitHub Actions run #679 verified 219/219 Node tests and the full shell/Python, restore-race, Compose, image-build/inspection and Caddy validation suite.

- RC-62 initial CI failure #672 was caused by legacy test-fixture files written with 0644 mode; the privacy gate correctly rejected them. Fixtures are being corrected to 0600, with fresh CI evidence pending.

- RC-63: RC-13 normalizes thrown identity-verifier callbacks to `signature_not_verified` (fail closed). CI run #686 verified 220/220 Node tests and the full infrastructure-validation suite. Real provider verification and API-route integration remain blockers.

- RC-64: mandatory identity claims must be own properties, not inherited values; CI run #695 verified 221/221 Node tests and the complete infrastructure-validation suite.


- RC-129: backup destination preflight now requires current-user ownership, owner rwx, and no group/world access; newly created destinations are private under umask 077. Focused reconstructed tests 2/2 and shell syntax passed, but RC-129 CI remains unverified. See `infra/rivercloud/RC129-BACKUP-DIRECTORY-PRIVACY.md`.

- RC-130: backup now rejects source data directories with unsafe ownership or group/world permissions. The focused reconstructed RC-129/130 tests passed 3/3; CI remains unverified. See `infra/rivercloud/RC130-BACKUP-SOURCE-PRIVACY.md`.



- RC-130 CI closeout: GitHub Actions run **45795579682 (#822) — SUCCESS, 252/252 Node tests**, 3/3 restore-directory replacement race tests, shell/Python syntax, Compose, API image build/inspection and Caddy validation. This includes the corrected RC-130 assertion; the earlier reconstructed-only test claim is superseded by this CI evidence.
- RC-131: the isolated CI workflow now installs pinned Trivy **v0.76.2**, generates a CycloneDX SBOM for the RiverCloud API image, records counts and SHA-256 in the job summary, and gates fixed HIGH/CRITICAL OS/library findings. A workflow regression test and technical note were added. Run **45799174492 (#829)** was queued at the time of this update; no scanner pass or scan findings are claimed yet. SBOM is ephemeral and not retained as an artifact. Scope is only the API image, not all services or the repository.

- RC-131 initial scan finding: CI **45799322843 (#832)** generated a CycloneDX SBOM (218 components, 28 vulnerability entries, SHA-256 `d5eb735a25c18d7447d42a8f1f90b84b92a94c5be500ec1af023420873ec1646`) but the gate failed with **10 fixed HIGH, 0 CRITICAL** in the bundled npm package tree. The API runtime does not need npm; the image now removes npm/corepack and CI checks their absence. Fresh scan evidence is pending.

- RC-131 remediation verified in CI **45800059060 (#843) — SUCCESS, 255/255 Node tests**, 3/3 restore race tests, shell/Python syntax, Compose, API image build/inspection, runtime package-manager check, SBOM, fixed HIGH/CRITICAL gate and Caddy validation. Tested SBOM: **21 components, 6 vulnerability entries**, SHA-256 `912296d8a3e4f2cb4d3f26a763488504824e26c0b632ef73123c265022519090`; fixed HIGH/CRITICAL gate had no matching findings. This does not assert all SBOM entries are harmless or all services are clean.
- RC-132 follow-up removes the remaining Yarn package directory and uses Trivy's `--pkg-types` flag instead of deprecated `--vuln-type`; fresh CI is pending.

- RC-132 closeout verified in CI **45800488045 (#854) — SUCCESS, 255/255 Node tests**, 3/3 restore race tests, syntax, Compose, API image build/inspection, package-manager absence check, SBOM, fixed HIGH/CRITICAL gate and Caddy validation. SBOM: **20 components, 6 vulnerability entries**, SHA-256 `38c5c50946df1276b8a3666a3d503653cfec7d9def89c869815cfe59d6980fc7`. The fixed HIGH/CRITICAL gate reported no matching findings; this does not imply zero vulnerabilities or a full repository/service scan.


- RC-134: RC-11 now rejects pre-existing symlink/non-directory components in the store path before reads and transactions; a regression test is added. CI pending and path-preflight race limitation documented.
