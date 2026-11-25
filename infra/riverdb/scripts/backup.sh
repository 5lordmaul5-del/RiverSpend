#!/usr/bin/env sh
set -eu
: "${RIVERDB_URL:?Set RIVERDB_URL}"
OUT="${1:-riverdb-backup-$(date -u +%Y%m%dT%H%M%SZ).dump}"
umask 077
pg_dump --format=custom --no-owner --no-acl "$RIVERDB_URL" > "$OUT"
printf 'Backup created: %s\n' "$OUT"
