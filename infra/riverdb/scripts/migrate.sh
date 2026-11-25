#!/usr/bin/env sh
set -eu
: "${RIVERDB_MIGRATION_URL:?Set RIVERDB_MIGRATION_URL}"
DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
MIGRATIONS="$DIR/../migrations"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT HUP INT TERM

# Establish the ledger before processing versioned migrations.
psql "$RIVERDB_MIGRATION_URL" -v ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA IF NOT EXISTS riverdb;
CREATE TABLE IF NOT EXISTS riverdb.schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now(),
  checksum text NOT NULL
);
SQL

for FILE in "$MIGRATIONS"/001_core.sql "$MIGRATIONS"/002_runtime_permissions.sql; do
  VERSION="$(basename "$FILE" .sql)"
  CHECKSUM="$(sha256sum "$FILE" | awk '{print $1}')"
  APPLIED="$(psql "$RIVERDB_MIGRATION_URL" -At -v ON_ERROR_STOP=1 -c "SELECT checksum FROM riverdb.schema_migrations WHERE version = '$VERSION'")"
  if [ -n "$APPLIED" ]; then
    if [ "$APPLIED" != "$CHECKSUM" ]; then
      echo "ERROR: checksum mismatch for applied migration $VERSION" >&2
      exit 1
    fi
    echo "Already applied and checksum verified: $VERSION"
    continue
  fi

  {
    echo "SELECT pg_advisory_lock(72420261125);"
    echo "\\set ON_ERROR_STOP on"
    echo "\\i '$FILE'"
    echo "INSERT INTO riverdb.schema_migrations(version, checksum) VALUES ('$VERSION', '$CHECKSUM');"
    echo "SELECT pg_advisory_unlock(72420261125);"
  } > "$TMP"
  echo "Applying migration: $VERSION"
  psql "$RIVERDB_MIGRATION_URL" -v ON_ERROR_STOP=1 -f "$TMP"
done
