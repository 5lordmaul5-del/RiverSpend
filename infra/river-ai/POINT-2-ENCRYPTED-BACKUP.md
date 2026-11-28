# RiverSSAI Point 2 — encrypted backup and restore drill

## Create
1. Start the owner runtime (Point 1).
2. In the repository root, set a backup passphrase in your shell (do not save it in files or Git):
   `export RIVER_AI_BACKUP_PASSPHRASE='a-long-unique-secret'`
3. Run: `bash infra/river-ai/backup-encrypted.sh`

The script streams a PostgreSQL custom-format dump, encrypts it using OpenSSL AES-256-CBC with PBKDF2 and 250,000 iterations, creates a SHA-256 checksum and a keyed HMAC-SHA256 integrity sidecar, and writes private files in the ignored local backup directory. Files are staged temporarily before final names are published. Keep the passphrase separate and secure.

## Restore drill
Run `bash infra/river-ai/restore-drill.sh <backup-file.dump.enc>` using the backup path. The script requires both sidecars, checks the SHA-256 digest and verifies the HMAC with the passphrase before decrypting. It restores into a uniquely named disposable database and drops that database on exit. It does not target the production/runtime database.

## Limitations
The procedure is not yet a real acceptance test. Off-host storage, retention, passphrase recovery and a restore test on a provisioned owner host remain outstanding. Do not commit backup files or secrets.
