#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="infra/river-ai/.env"
[[ -f "$ENV_FILE" ]] || { echo "Missing private runtime env file." >&2; exit 1; }
: "${RIVERBACKUP_PASSPHRASE:?Set RIVERBACKUP_PASSPHRASE in the shell; never store it in repository files}"
: "${RIVERBACKUP_FILE:?Set RIVERBACKUP_FILE to the encrypted dump path}"
: "${RIVERBACKUP_TARGET_DB:?Set RIVERBACKUP_TARGET_DB to an existing, disposable/empty restore database}"
[[ ${#RIVERBACKUP_PASSPHRASE} -ge 32 ]] || { echo "Passphrase must be at least 32 characters." >&2; exit 1; }
[[ -f "$RIVERBACKUP_FILE" && -f "$RIVERBACKUP_FILE.sha256" && -f "$RIVERBACKUP_FILE.hmac" ]] || { echo "Backup, checksum, and HMAC files are required." >&2; exit 1; }
sha256sum -c "$RIVERBACKUP_FILE.sha256"
expected_hmac="$(cat "$RIVERBACKUP_FILE.hmac")"
actual_hmac="$(openssl dgst -sha256 -hmac "$RIVERBACKUP_PASSPHRASE" "$RIVERBACKUP_FILE" | awk '{print $NF}')"
[[ "$actual_hmac" == "$expected_hmac" ]] || { echo "Backup HMAC verification failed." >&2; exit 1; }
# Restore only into an explicitly named target DB; no drop/clean options are used.
# Prefer an empty disposable database. pg_restore will stop on errors.
docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb pg_restore --list < <(openssl enc -d -aes-256-cbc -pbkdf2 -salt -md sha256 -pass env:RIVERBACKUP_PASSPHRASE -in "$RIVERBACKUP_FILE") >/dev/null
openssl enc -d -aes-256-cbc -pbkdf2 -salt -md sha256 -pass env:RIVERBACKUP_PASSPHRASE -in "$RIVERBACKUP_FILE" |
  docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb pg_restore -U rivercore -d "$RIVERBACKUP_TARGET_DB" --no-owner --no-acl --exit-on-error
echo "Restore completed into target database: $RIVERBACKUP_TARGET_DB"
