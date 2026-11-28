#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="infra/river-ai/.env"
BACKUP="${1:-}"
if [[ -z "$BACKUP" || ! -f "$BACKUP" ]]; then echo "Usage: $0 backup-file.dump.enc" >&2; exit 2; fi
if [[ ! -f "$ENV_FILE" ]]; then echo "Runtime .env missing." >&2; exit 1; fi
if [[ -z "${RIVER_AI_BACKUP_PASSPHRASE:-}" ]]; then echo "Set RIVER_AI_BACKUP_PASSPHRASE." >&2; exit 1; fi
command -v openssl >/dev/null || exit 1
command -v docker >/dev/null || exit 1
command -v sha256sum >/dev/null || exit 1
if [[ ! -f "$BACKUP.sha256" || ! -f "$BACKUP.hmac" ]]; then echo "Integrity sidecars missing; refusing restore." >&2; exit 1; fi
CHECK_DIR="$(dirname "$BACKUP")"
CHECK_FILE="$(basename "$BACKUP")"
(cd "$CHECK_DIR" && sha256sum -c "$CHECK_FILE.sha256") || { echo "Checksum failed; refusing restore." >&2; exit 1; }
EXPECTED="$(awk '{print $1}' "$BACKUP.hmac")"
ACTUAL="$(openssl dgst -sha256 -hmac "$RIVER_AI_BACKUP_PASSPHRASE" "$BACKUP" | awk '{print $NF}')"
if [[ -z "$EXPECTED" || "$EXPECTED" != "$ACTUAL" ]]; then echo "HMAC authentication failed; refusing restore." >&2; exit 1; fi
TMP="$(mktemp)"
NAME="river_restore_drill_$(date -u +%Y%m%d%H%M%S)_$$"
CREATED=0
cleanup() {
  rm -f "$TMP"
  if [[ "$CREATED" == "1" ]]; then
    docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb dropdb -U rivercore --if-exists "$NAME" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT
openssl enc -d -aes-256-cbc -pbkdf2 -iter 250000 -in "$BACKUP" -out "$TMP" -pass env:RIVER_AI_BACKUP_PASSPHRASE
[[ -s "$TMP" ]] || { echo "Decrypted dump is empty." >&2; exit 1; }
docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb createdb -U rivercore "$NAME"
CREATED=1
docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb pg_restore -U rivercore -d "$NAME" --no-owner --no-privileges < "$TMP"
TABLES="$(docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb psql -U rivercore -d "$NAME" -Atc "SELECT count(*) FROM pg_catalog.pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema');")"
echo "Restore drill loaded successfully into disposable database $NAME."
echo "Non-system tables detected: $TABLES (database will be dropped on exit)."
