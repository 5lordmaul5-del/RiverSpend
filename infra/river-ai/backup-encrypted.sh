#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="infra/river-ai/.env"
BACKUP_DIR="${RIVER_AI_BACKUP_DIR:-$ROOT/infra/river-ai/backups}"
if [[ ! -f "$ENV_FILE" ]]; then echo "Runtime .env missing." >&2; exit 1; fi
if [[ -z "${RIVER_AI_BACKUP_PASSPHRASE:-}" ]]; then echo "Set RIVER_AI_BACKUP_PASSPHRASE (never store it in the repo)." >&2; exit 1; fi
command -v openssl >/dev/null || { echo "openssl required." >&2; exit 1; }
command -v docker >/dev/null || { echo "docker required." >&2; exit 1; }
command -v sha256sum >/dev/null || { echo "sha256sum required." >&2; exit 1; }
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TMP="$(mktemp)"
ENC_TMP="$BACKUP_DIR/.rivercore-$STAMP.enc.tmp"
trap 'rm -f "$TMP" "$ENC_TMP" "$ENC_TMP.sha256" "$ENC_TMP.hmac"' EXIT
docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb pg_dump -U rivercore -d rivercore --format=custom > "$TMP"
[[ -s "$TMP" ]] || { echo "Empty dump." >&2; exit 1; }
OUT="$BACKUP_DIR/rivercore-$STAMP.dump.enc"
openssl enc -aes-256-cbc -pbkdf2 -salt -iter 250000 -in "$TMP" -out "$ENC_TMP" -pass env:RIVER_AI_BACKUP_PASSPHRASE
[[ -s "$ENC_TMP" ]] || { echo "Empty encrypted output." >&2; exit 1; }
chmod 600 "$ENC_TMP"
sha256sum "$ENC_TMP" | awk '{print $1}' > "$ENC_TMP.sha256"
openssl dgst -sha256 -hmac "$RIVER_AI_BACKUP_PASSPHRASE" "$ENC_TMP" > "$ENC_TMP.hmac"
mv "$ENC_TMP" "$OUT"
mv "$ENC_TMP.sha256" "$OUT.sha256"
mv "$ENC_TMP.hmac" "$OUT.hmac"
chmod 600 "$OUT" "$OUT.sha256" "$OUT.hmac"
echo "Encrypted backup created: $OUT"
echo "Checksum and HMAC sidecars created."
echo "Keep passphrase separately; never commit backups or .env."
