# RC-104 — Backup/restore audit checkpoint
Date: 2026-11-26
Branch: feat/rivercloud-core-2026-11-25
Scope: source inspection of backup.sh, restore.sh, restore-safe.py and backup-restore tests.

## Controls observed
- Backup destination must be separate from data directory.
- Backup refuses root data directory, symlinks/special entries, hardlinks, and active lock/temp files.
- Backup uses restrictive umask and writes a SHA-256 checksum sidecar.
- Restore requires explicit confirmation and checksum verification.
- Restore target must not exist; extraction uses restricted tar entry types and directory descriptor protections.
- Restore limits archive member count and total bytes (as shown in implementation).
- Existing tests cover round-trip, denied confirmation, symlinks, hardlinks, special files, root data directory and target overwrite denial.

## Next test gaps to check
- Boundary behavior at member-count and total-byte limits.
- Malformed archive and truncated checksum/archive behavior.
- Deep nested paths and unusual path encodings.
- Failure during extraction cleanup and target ownership identity checks.
- Portability: dirfd and no-follow support are required; restore should fail safely if unavailable.

## Status
Read-only checkpoint; no backup of live data or restore drill was performed.
