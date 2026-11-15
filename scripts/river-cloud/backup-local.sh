#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/infra/river-cloud/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Copy .env.example to .env and configure it." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${RIVER_CLOUD_DB_PASSWORD:?Set RIVER_CLOUD_DB_PASSWORD}"
: "${RIVER_CLOUD_AGE_RECIPIENT:?Set RIVER_CLOUD_AGE_RECIPIENT}"
command -v docker >/dev/null || { echo "docker is required" >&2; exit 1; }
command -v age >/dev/null || { echo "age is required" >&2; exit 1; }
command -v sha256sum >/dev/null || { echo "sha256sum is required" >&2; exit 1; }

BACKUP_DIR="${RIVER_CLOUD_BACKUP_DIR:-$ROOT_DIR/infra/river-cloud/backups}"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/rivercloud-$STAMP.dump.age"
CHECKSUM="$OUT.sha256"

cd "$ROOT_DIR/infra/river-cloud"
docker compose exec -T -e PGPASSWORD="$RIVER_CLOUD_DB_PASSWORD" rivercloud-db \
  pg_dump -h 127.0.0.1 -U rivercloud -d rivercloud -Fc --no-owner --no-acl \
  | age -r "$RIVER_CLOUD_AGE_RECIPIENT" -o "$OUT"

sha256sum "$OUT" > "$CHECKSUM"
chmod 600 "$OUT" "$CHECKSUM"
echo "Encrypted backup created: $OUT"
echo "Checksum created: $CHECKSUM"
