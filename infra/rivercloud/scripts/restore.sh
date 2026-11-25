#!/usr/bin/env sh
set -eu
: "${RIVERCLOUD_BACKUP_ARCHIVE:?Set RIVERCLOUD_BACKUP_ARCHIVE to a backup archive}"
: "${RIVERCLOUD_RESTORE_TARGET:?Set RIVERCLOUD_RESTORE_TARGET to a new restore directory}"
if [ "${CONFIRM_RIVERCLOUD_RESTORE:-}" != "YES" ]; then echo "Refusing restore; set CONFIRM_RIVERCLOUD_RESTORE=YES" >&2; exit 2; fi
[ -f "$RIVERCLOUD_BACKUP_ARCHIVE" ] || { echo "archive missing" >&2; exit 2; }
archive=$(cd "$(dirname "$RIVERCLOUD_BACKUP_ARCHIVE")" && pwd)/$(basename "$RIVERCLOUD_BACKUP_ARCHIVE")
base=$(basename "$archive")
[ -f "$archive.sha256" ] || { echo "checksum file missing" >&2; exit 2; }
(cd "$(dirname "$archive")" && sha256sum -c "$base.sha256")
[ ! -e "$RIVERCLOUD_RESTORE_TARGET" ] || { echo "restore target must not already exist" >&2; exit 2; }
# Reject absolute or parent-traversal entries before extraction to the new target.
while IFS= read -r entry; do
  case "$entry" in /*) echo "unsafe archive path" >&2; exit 2;; esac
  normalized="$entry"
  while [ "$normalized" = "./"* ]; do normalized=${normalized#./}; done
  case "$normalized" in ..|../*|*/../*|*/..) echo "unsafe archive path" >&2; exit 2;; esac
done <<EOF2
$(tar -tzf "$archive")
EOF2
mkdir -p "$RIVERCLOUD_RESTORE_TARGET"
tar --no-same-owner --no-same-permissions -xzf "$archive" -C "$RIVERCLOUD_RESTORE_TARGET"
