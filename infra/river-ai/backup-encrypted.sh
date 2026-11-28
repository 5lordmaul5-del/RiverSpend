#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="infra/river-ai/.env"
BACKUP_DIR="${RIVER_AI_BACKUP_DIR:-$ROOT/infra/river-ai/backups}"
if [[ ! -f "$ENV_FILE" ]]; then echo "Runtime .env missing." >&2; exit 1; fi
if [[ -z "${RIVER_AI_BACKUP_PASSPHRASE:-}" ]]; then echo "Set RIVER_AI_BACKUP_PASSPHRASE (never store it in the repo)." >&2; exit 1; fi
command -v openssl >/dev/null || { echo "openssl required." >&2; exit 1; }
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb pg_dump -U rivercore -d rivercore --format=custom > "$TMP"
[[ -s "$TMP" ]] || { echo "Empty dump." >&2; exit 1; }
OUT="$BACKUP_DIR/rivercore-$STAMP.dump.enc"
openssl enc -aes-256-cbc -pbkdf2 -salt -iter 250000 -in "$TMP" -out "$OUT" -pass env:RIVER_AI_BACKUP_PASSPHRASE
chmod 600 "$OUT"
openssl dgst -sha256 "$OUT" > "$OUT.sha256"
chmod 600 "$OUT.sha256"
echo "Encrypted backup created: $OUT"
echo "Checksum: $OUT.sha256"
echo "Keep passphrase separately; never commit backups or .env."
