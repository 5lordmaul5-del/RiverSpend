#!/usr/bin/env sh
set -eu
: "${RIVERDB_MIGRATION_URL:?Set RIVERDB_MIGRATION_URL}"
DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
MIGRATIONS="$DIR/../migrations"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT HUP INT TERM

# Establish the ledger before processing versioned migrations.
psql "$RIVERDB_MIGRATION_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT pg_advisory_lock(72420261125);
CREATE SCHEMA IF NOT EXISTS riverdb;
CREATE TABLE IF NOT EXISTS riverdb.schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now(),
  checksum text NOT NULL
);
SELECT pg_advisory_unlock(72420261125);
SQL

for FILE in "$MIGRATIONS"/001_core.sql "$MIGRATIONS"/002_runtime_permissions.sql; do
  VERSION="$(basename "$FILE" .sql)"
  CHECKSUM="$(sha256sum "$FILE" | awk '{print $1}')"

  # Lock, inspect the ledger, and apply within one psql session to avoid races.
  {
    echo "SELECT pg_advisory_lock(72420261125);"
    echo "\\set ON_ERROR_STOP on"
    echo "SELECT count(*) AS migration_exists FROM riverdb.schema_migrations WHERE version = '$VERSION' \\gset"
    echo "\\if :migration_exists"
    echo "SELECT (checksum = '$CHECKSUM') AS checksum_ok FROM riverdb.schema_migrations WHERE version = '$VERSION' \\gset"
    echo "\\if :checksum_ok"
    echo "SELECT 'Already applied and checksum verified: $VERSION';"
    echo "\\else"
    echo "SELECT 1/0;"
    echo "\\endif"
    echo "\\else"
    echo "SELECT 'Applying migration: $VERSION';"
    echo "\\i '$FILE'"
    echo "INSERT INTO riverdb.schema_migrations(version, checksum) VALUES ('$VERSION', '$CHECKSUM');"
    echo "\\endif"
    echo "SELECT pg_advisory_unlock(72420261125);"
  } > "$TMP"
  psql "$RIVERDB_MIGRATION_URL" -v ON_ERROR_STOP=1 -f "$TMP"
done
