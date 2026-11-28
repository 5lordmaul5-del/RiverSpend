# RiverSSAI Point 2 — encrypted backup

## Create
1. Start the owner runtime (Point 1).
2. In the repository root, set a backup passphrase in your shell (do not save it in files or Git):
   `export RIVER_AI_BACKUP_PASSPHRASE='a-long-unique-secret'`
3. Run: `bash infra/river-ai/backup-encrypted.sh`

The script streams a PostgreSQL custom-format dump from the local container, encrypts it using OpenSSL AES-256-CBC with PBKDF2 and 250,000 iterations, writes mode-0600 output into the ignored local backups directory and emits a SHA-256 checksum. The passphrase is not generated or saved by this script; store it separately and securely. The backups directory is ignored by Git.

## Important limitations
This is backup creation, not a restore acceptance test or a disaster-recovery guarantee. It is local-only and depends on the owner host, disk and Docker runtime. Off-host copy, passphrase recovery, retention policy and a disposable restore validation are the next steps. Keep the passphrase distinct from runtime credentials. Do not commit backup files.

## Verify checksum
`sha256sum -c <backup-file>.sha256`
