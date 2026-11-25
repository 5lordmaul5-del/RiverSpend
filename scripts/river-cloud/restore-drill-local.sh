#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/infra/river-cloud/.env"

if [[ $# -ne 1 ]]; then
  echo "Usage: bash scripts/river-cloud/restore-drill-local.sh <backup.dump.age>" >&2
  exit 2
fi

BACKUP_FILE="$1"
if [[ "$BACKUP_FILE" != /* ]]; then
  BACKUP_FILE="$(cd "$(dirname "$BACKUP_FILE")" && pwd)/$(basename "$BACKUP_FILE")"
fi
[[ -f "$BACKUP_FILE" ]] || { echo "Backup file not found: $BACKUP_FILE" >&2; exit 1; }
[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE. Copy .env.example to .env and configure it." >&2; exit 1; }

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${RIVER_CLOUD_AGE_IDENTITY_FILE:?Set RIVER_CLOUD_AGE_IDENTITY_FILE to the private age identity file}"
[[ -r "$RIVER_CLOUD_AGE_IDENTITY_FILE" ]] || {
  echo "age identity file is not readable" >&2
  exit 1
}

for cmd in docker age sha256sum openssl; do
  command -v "$cmd" >/dev/null || { echo "$cmd is required" >&2; exit 1; }
done

# Verify the encrypted artifact before attempting decryption.
[[ -f "$BACKUP_FILE.sha256" ]] || {
  echo "Missing checksum file: $BACKUP_FILE.sha256" >&2
  exit 1
}
EXPECTED_CHECKSUM="$(awk 'NR == 1 {print $1}' "$BACKUP_FILE.sha256")"
ACTUAL_CHECKSUM="$(sha256sum "$BACKUP_FILE" | awk '{print $1}')"
[[ -n "$EXPECTED_CHECKSUM" && "$EXPECTED_CHECKSUM" == "$ACTUAL_CHECKSUM" ]] || {
  echo "Backup checksum verification failed." >&2
  exit 1
}

# The disposable database has no published ports, no persistent volume, and no network.
# Plaintext SQL/custom dump data is streamed directly into pg_restore, never written to disk.
CONTAINER_NAME="rivercloud-restore-drill-$$"
TEMP_PASSWORD="$(openssl rand -hex 32)"
cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run --detach \
  --name "$CONTAINER_NAME" \
  --network none \
  --env POSTGRES_PASSWORD="$TEMP_PASSWORD" \
  postgres:17-alpine >/dev/null

READY=0
for _ in $(seq 1 60); do
  if docker exec "$CONTAINER_NAME" pg_isready -U postgres -d postgres >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done
[[ "$READY" -eq 1 ]] || { echo "Disposable PostgreSQL did not become ready." >&2; exit 1; }

# pg_isready can report a server ready even when the requested database is missing.
# Bootstrap the target DB explicitly against the always-present maintenance database.
if ! docker exec "$CONTAINER_NAME" psql -U postgres -d postgres -At \
  -c "SELECT 1 FROM pg_database WHERE datname = 'rivercloud_restore';" | grep -q '^1$'; then
  docker exec "$CONTAINER_NAME" psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
    -c "CREATE DATABASE rivercloud_restore;"
fi

# The restored RLS policies reference this role. Create a restricted placeholder
# role in the disposable cluster before pg_restore; it is not used for login.
docker exec "$CONTAINER_NAME" psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
  -c "CREATE ROLE rivercloud_api NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;"

age --decrypt --identity "$RIVER_CLOUD_AGE_IDENTITY_FILE" "$BACKUP_FILE" \
  | docker exec -i "$CONTAINER_NAME" pg_restore \
      --username=postgres \
      --dbname=rivercloud_restore \
      --no-owner \
      --no-acl \
      --exit-on-error

TABLE_COUNT="$(docker exec "$CONTAINER_NAME" psql -U postgres -d rivercloud_restore -At \
  -c "SELECT count(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema');")"
RESTORE_MARKER="$(docker exec "$CONTAINER_NAME" psql -U postgres -d rivercloud_restore -At \
  -c "SELECT marker FROM public.restore_probe WHERE id = 1;")"
[[ "$RESTORE_MARKER" == "rivercloud-ci" ]] || {
  echo "Restore data verification failed: expected restore_probe marker rivercloud-ci." >&2
  exit 1
}

echo "Restore drill passed in disposable isolated PostgreSQL."
echo "Restored application tables: $TABLE_COUNT"
echo "Disposable database will now be removed."
