# RC-129 — Backup destination privacy preflight

Date: 2026-11-26
Branch: `feat/rivercloud-core-2026-11-25`

## Finding

The backup script canonicalized the backup directory and kept archive files private, but it did not check the directory's owner or permissions. It also created a missing destination before setting the restrictive umask. A pre-existing group/world-accessible directory could expose names and permit unwanted directory-level manipulation.

## Change

- Apply `umask 077` before creating the backup destination.
- Check that the canonical backup destination is owned by the current UID.
- Require owner read/write/execute permissions and reject group/world permission bits.
- Fail closed without silently chmod/chowning an existing destination.

## Regression coverage

- A newly created backup destination is mode 0700 and the backup completes in a disposable fixture.
- An existing destination with group/world access is rejected before publishing files.

## Evidence and limitations

- Focused tests in a reconstructed temporary workspace: **2/2 passed**; shell syntax check passed. This is not a full repository checkout and does not constitute GitHub Actions evidence.
- A local clone attempt failed because DNS could not resolve github.com.
- The prior verified branch-head workflow (RC-128) run **45790894733 (#794)** passed **249/249 Node tests**, 3/3 restore-directory race checks, bootstrap/backup/restore/Python validation, Compose, isolated API image build/inspection, and Caddy validation. It does **not** verify RC-129.
- The GitHub Contents API commits made in this increment did not yield an independently retrievable PR workflow run. CI for RC-129 remains unverified.

## Safety

No live backup/restore, RiverCloud service, runner, staging, merge, deployment, provisioning, production data/credentials or spending was performed.
