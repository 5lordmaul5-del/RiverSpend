#!/usr/bin/env sh
set -eu
: "${RIVERDB_URL:?Set RIVERDB_URL}"
FILE="${1:?Usage: restore.sh backup.dump}"
if [ "${CONFIRM_RIVERDB_RESTORE:-}" != "YES" ]; then
  echo "Refusing restore. Set CONFIRM_RIVERDB_RESTORE=YES explicitly." >&2
  exit 2
fi
pg_restore --clean --if-exists --no-owner --no-acl --dbname "$RIVERDB_URL" "$FILE"
