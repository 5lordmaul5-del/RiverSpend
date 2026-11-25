#!/usr/bin/env sh
set -eu
: "${RIVERDB_URL:?Set RIVERDB_URL}"
PSQL="psql $RIVERDB_URL -v ON_ERROR_STOP=1 -tAc"
if ! psql "$RIVERDB_URL" -v ON_ERROR_STOP=1 -c "SELECT 1" >/dev/null; then
  echo "RiverDB health: FAIL (connection)" >&2
  exit 1
fi
MIGRATIONS=$(psql "$RIVERDB_URL" -v ON_ERROR_STOP=1 -tAc "SELECT count(*) FROM riverdb.schema_migrations")
MODULES=$(psql "$RIVERDB_URL" -v ON_ERROR_STOP=1 -tAc "SELECT count(*) FROM riverdb.modules")
TASK_TABLE=$(psql "$RIVERDB_URL" -v ON_ERROR_STOP=1 -tAc "SELECT to_regclass('riverdb.tasks') IS NOT NULL")
EVENT_TABLE=$(psql "$RIVERDB_URL" -v ON_ERROR_STOP=1 -tAc "SELECT to_regclass('riverdb.events') IS NOT NULL")
AUDIT_TABLE=$(psql "$RIVERDB_URL" -v ON_ERROR_STOP=1 -tAc "SELECT to_regclass('audit.records') IS NOT NULL")
[ "$MIGRATIONS" -ge 2 ] || { echo "RiverDB health: FAIL (migration ledger)" >&2; exit 1; }
[ "$MODULES" -ge 3 ] || { echo "RiverDB health: FAIL (module registry)" >&2; exit 1; }
[ "$TASK_TABLE" = "t" ] && [ "$EVENT_TABLE" = "t" ] && [ "$AUDIT_TABLE" = "t" ] || { echo "RiverDB health: FAIL (required tables)" >&2; exit 1; }
echo "RiverDB health: OK"
echo "Migrations applied: $MIGRATIONS"
echo "Registered modules: $MODULES"
echo "Required tables: tasks=$TASK_TABLE events=$EVENT_TABLE audit=$AUDIT_TABLE"
psql "$RIVERDB_URL" -v ON_ERROR_STOP=1 -c "SELECT current_database() AS database, pg_size_pretty(pg_database_size(current_database())) AS size, (SELECT count(*) FROM pg_stat_activity WHERE datname=current_database()) AS connections;"
