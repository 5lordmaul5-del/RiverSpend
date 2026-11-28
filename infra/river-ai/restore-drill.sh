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
TMP="$(mktemp)"
NAME="river_restore_drill_$(date -u +%Y%m%d%H%M%S)"
trap 'rm -f "$TMP"; docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb dropdb -U rivercore --if-exists "$NAME" >/dev/null 2>&1 || true' EXIT
openssl enc -d -aes-256-cbc -pbkdf2 -iter 250000 -in "$BACKUP" -out "$TMP" -pass env:RIVER_AI_BACKUP_PASSPHRASE
docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb createdb -U rivercore "$NAME"
docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb pg_restore -U rivercore -d "$NAME" --no-owner --no-privileges < "$TMP"
docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb psql -U rivercore -d "$NAME" -Atc "SELECT count(*) FROM pg_catalog.pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema');"
echo "Restore drill loaded successfully into disposable database $NAME; it will be dropped on exit."
