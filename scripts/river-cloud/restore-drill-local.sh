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
  --env POSTGRES_DB=rivercloud_restore \
  postgres:17-alpine >/dev/null

READY=0
for _ in $(seq 1 60); do
  # pg_isready alone can report the server as ready before POSTGRES_DB has
  # finished initialization. Confirm the target database actually exists.
  if docker exec "$CONTAINER_NAME" psql -U postgres -d postgres -Atqc \
    "SELECT 1 FROM pg_database WHERE datname = 'rivercloud_restore'" 2>/dev/null | grep -qx "1"; then
    READY=1
    break
  fi
  sleep 1
done
[[ "$READY" -eq 1 ]] || { echo "Disposable PostgreSQL restore database was not initialized." >&2; exit 1; }

# The dump contains RLS policies that reference this application role.
# Create it explicitly in the disposable target before restoring the schema.
docker exec "$CONTAINER_NAME" \
  psql -U postgres -d rivercloud_restore -v ON_ERROR_STOP=1 \
  -c "CREATE ROLE rivercloud_api NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;"

age --decrypt --identity "$RIVER_CLOUD_AGE_IDENTITY_FILE" "$BACKUP_FILE" \
  | docker exec -i "$CONTAINER_NAME" pg_restore \
      --username=postgres \
      --dbname=rivercloud_restore \
      --no-owner \
      --no-acl \
      --exit-on-error

# The backup intentionally omits ACLs; restore the minimum grants required
# for the application-role RLS regression without granting login capability.
docker exec "$CONTAINER_NAME" \
  psql -U postgres -d rivercloud_restore -v ON_ERROR_STOP=1 \
  -c "GRANT USAGE ON SCHEMA rivercloud TO rivercloud_api; GRANT SELECT, INSERT, UPDATE ON rivercloud.user_profiles TO rivercloud_api;"

# Re-run the ownership-isolation regression against the restored schema.
docker exec -i "$CONTAINER_NAME" \
  psql -U postgres -d rivercloud_restore -v ON_ERROR_STOP=1 \
  < "$ROOT_DIR/scripts/river-cloud/test-rls.sql"

TABLE_COUNT="$(docker exec "$CONTAINER_NAME" psql -U postgres -d rivercloud_restore -At \
  -c "SELECT count(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema');")"

echo "Restore drill passed in disposable isolated PostgreSQL."
echo "Restored application tables: $TABLE_COUNT"
echo "Disposable database will now be removed."
