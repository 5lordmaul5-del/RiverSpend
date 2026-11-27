# RC212 — Memory Integrity, Backup & Recovery

## Scope
Local companion prototype for RC211 SQLite-backed graph memory.

- Read-only database integrity checks (SQLite integrity check and foreign-key check where schema supports it).
- SQLite online-backup API to produce backups without raw-copying a live DB.
- Backup verification and SHA-256 manifest.
- Controlled restore: verify manifest hash and DB integrity; stage restore in destination directory; verify staged file before atomic replacement.
- Refuses missing files, invalid integrity, and hash mismatch.

## Run
From this directory:
`python -m unittest -v test_rc212_memory_recovery.py`

## Safety boundaries
- Restore replaces the destination file; operator should ensure the target is correct and take an additional backup before restoring in real use.
- Prototype does not encrypt backups, protect manifest signing keys, manage backup retention, remotely replicate, or ensure multi-process coordination.
- SHA-256 manifest is not signed; an attacker who can replace both database and manifest can alter both.
- Staged atomic replacement is best-effort across platform/filesystem boundaries.
- Tests are authored but not yet run in this PR environment.
- No merge or deployment is performed.
