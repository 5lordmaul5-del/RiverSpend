#!/usr/bin/env sh
set -eu
: "${RIVERCLOUD_DATA_DIR:?Set RIVERCLOUD_DATA_DIR to the data directory}"
: "${RIVERCLOUD_BACKUP_DIR:?Set RIVERCLOUD_BACKUP_DIR to a separate backup directory}"
[ -d "$RIVERCLOUD_DATA_DIR" ] || { echo "data directory missing" >&2; exit 2; }
DATA_DIR=$(cd "$RIVERCLOUD_DATA_DIR" && pwd)
mkdir -p "$RIVERCLOUD_BACKUP_DIR"
BACKUP_DIR=$(cd "$RIVERCLOUD_BACKUP_DIR" && pwd)
case "$BACKUP_DIR" in "$DATA_DIR"|"$DATA_DIR"/*) echo "backup directory must be outside the data directory" >&2; exit 2;; esac
if find "$DATA_DIR" -type l -print -quit | grep -q .; then echo "symlinks in data directory are not supported" >&2; exit 2; fi
umask 077
base="rivercloud-data-$(date -u +%Y%m%dT%H%M%SZ)-$$.tar.gz"
archive="$BACKUP_DIR/$base"
tar --exclude="*.lock" --exclude="*.tmp-*" -czf "$archive" -C "$DATA_DIR" .
(cd "$BACKUP_DIR" && sha256sum "$base" > "$base.sha256")
printf '%s\n' "$archive"
