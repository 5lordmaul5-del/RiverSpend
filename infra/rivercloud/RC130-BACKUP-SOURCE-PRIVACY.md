# RC-130 — Backup source-directory privacy preflight

Date: 2026-11-26
Branch: `feat/rivercloud-core-2026-11-25`

## Finding

The backup script did not verify ownership or privacy of the source data directory itself. The state store has its own privacy checks, but the standalone backup entry point should fail closed when pointed at a permissive or foreign-owned source.

## Change

- Require the canonical source directory to be owned by the current UID.
- Require owner rwx and reject group/world permission bits.
- Fail before archiving; do not silently repair the source directory.

## Regression coverage

- Added a test rejecting a source directory with group/world access.
- Adjusted backup fixtures to create private 0700 source directories, preserving explicit unsafe-mode test cases.

## Evidence and limitations

- Reconstructed focused test workspace: **3/3 passed** (RC-129 destination creation, RC-129 permissive destination rejection, RC-130 source privacy rejection) and shell syntax passed.
- This is not a full repository checkout or direct execution of the repository test file.
- GitHub Actions for RC-130 remains unverified; no CI pass is claimed.
- The earlier verified RC-128 workflow **45790894733 (#794)** passed **249/249 Node tests**, but does not cover RC-129/130.
- A local clone attempt failed because github.com DNS resolution was unavailable.

## Safety

No real backup/restore, service, runner, staging, merge, deployment, production data/credentials, provisioning or spending was performed.

### RC-130 test-review correction

- Corrected the negative test to assert that the backup destination remains empty after source-directory rejection. It no longer expects an existing destination to have been made private, because the fail-closed source check runs first and does not modify an existing directory.
- This test-only correction has no independent CI evidence.
