# RC-19 — local queue/data backup and restore scripts

This increment adds portable shell scripts for a local data directory snapshot and restore rehearsal.

- Backups are written outside the source data directory and use restrictive permissions.
- Symlinked source entries are refused.
- Temporary lock files and write-in-progress files are excluded.
- A SHA-256 checksum file is created and verified before restore.
- Restore requires `CONFIRM_RIVERCLOUD_RESTORE=YES` and a new, non-existing target directory; it never overwrites an existing target.
- Restore extraction is staged into that new directory. No production restore or live data operation was performed.

## Limits

This is a local snapshot/checksum facility, not encrypted, off-site, immutable or monitored backup storage. It does not provide database-aware consistency if a process is writing during snapshot; use a stopped or otherwise quiesced store for important snapshots. A checksum detects accidental corruption, not a maliciously replaced archive/checksum pair. A real backup plan must add encryption, separated credentials, retention, monitoring and restore drills.

## Test evidence

The scripts and tests run only in temporary directories in the local test suite. No production files are touched.
