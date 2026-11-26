#!/usr/bin/env sh
set -eu
: "${RIVERCLOUD_DATA_DIR:?Set RIVERCLOUD_DATA_DIR to the data directory}"
: "${RIVERCLOUD_BACKUP_DIR:?Set RIVERCLOUD_BACKUP_DIR to a separate backup directory}"
[ -d "$RIVERCLOUD_DATA_DIR" ] || { echo "data directory missing" >&2; exit 2; }
DATA_DIR=$(cd "$RIVERCLOUD_DATA_DIR" && pwd -P)
case "$DATA_DIR" in /) echo "root data directory is not supported" >&2; exit 2;; esac
mkdir -p "$RIVERCLOUD_BACKUP_DIR"
BACKUP_DIR=$(cd "$RIVERCLOUD_BACKUP_DIR" && pwd -P)
case "$BACKUP_DIR" in "$DATA_DIR"|"$DATA_DIR"/*) echo "backup directory must be outside the data directory" >&2; exit 2;; esac
if find "$DATA_DIR" -mindepth 1 ! -type d ! -type f -print -quit | grep -q .; then echo "unsupported entry types (symlinks and special files) in data directory" >&2; exit 2; fi
if find "$DATA_DIR" -type f -links +1 -print -quit | grep -q .; then echo "hardlinked files in data directory are not supported" >&2; exit 2; fi
if find "$DATA_DIR" -type f \( -name "*.lock" -o -name "*.tmp-*" \) -print -quit | grep -q .; then echo "transaction lock or temporary file present; quiesce and retry" >&2; exit 2; fi
umask 077
base="rivercloud-data-$(date -u +%Y%m%dT%H%M%SZ)-$$.tar.gz"
archive="$BACKUP_DIR/$base"
tar --exclude="*.lock" --exclude="*.tmp-*" -czf "$archive" -C "$DATA_DIR" .
(cd "$BACKUP_DIR" && sha256sum "$base" > "$base.sha256")
printf '%s\n' "$archive"
