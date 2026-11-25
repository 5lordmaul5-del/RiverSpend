#!/usr/bin/env sh
set -eu
: "${RIVERDB_MIGRATION_URL:?Set RIVERDB_MIGRATION_URL}"
DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
psql "$RIVERDB_MIGRATION_URL" -v ON_ERROR_STOP=1 -f "$DIR/../migrations/001_core.sql"
psql "$RIVERDB_MIGRATION_URL" -v ON_ERROR_STOP=1 -f "$DIR/../migrations/002_runtime_permissions.sql"
