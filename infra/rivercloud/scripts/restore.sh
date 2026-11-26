#!/usr/bin/env sh
set -eu
: "${RIVERCLOUD_BACKUP_ARCHIVE:?Set RIVERCLOUD_BACKUP_ARCHIVE to a backup archive}"
: "${RIVERCLOUD_RESTORE_TARGET:?Set RIVERCLOUD_RESTORE_TARGET to a new restore directory}"
if [ "${CONFIRM_RIVERCLOUD_RESTORE:-}" != "YES" ]; then echo "Refusing restore; set CONFIRM_RIVERCLOUD_RESTORE=YES" >&2; exit 2; fi
command -v python3 >/dev/null 2>&1 || { echo "python3 is required for safe restore extraction" >&2; exit 2; }
command -v sha256sum >/dev/null 2>&1 || { echo "sha256sum is required" >&2; exit 2; }
[ -f "$RIVERCLOUD_BACKUP_ARCHIVE" ] || { echo "archive missing" >&2; exit 2; }
archive=$(cd "$(dirname "$RIVERCLOUD_BACKUP_ARCHIVE")" && pwd)/$(basename "$RIVERCLOUD_BACKUP_ARCHIVE")
base=$(basename "$archive")
# Bound archive bytes before checksum work; Python validates the same setting again during extraction.
RIVERCLOUD_RESTORE_MAX_ARCHIVE_BYTES=${RIVERCLOUD_RESTORE_MAX_ARCHIVE_BYTES:-21474836480}
python3 - "$archive" "$RIVERCLOUD_RESTORE_MAX_ARCHIVE_BYTES" <<'PY'
import os, sys
try:
 limit = int(sys.argv[2])
 if limit < 1: raise ValueError
 size = os.stat(sys.argv[1], follow_symlinks=False).st_size
 if size > limit:
  print("archive compressed-size limit exceeded", file=sys.stderr)
  raise SystemExit(2)
except (ValueError, OSError):
 print("restore limits must be positive integers or archive unavailable", file=sys.stderr)
 raise SystemExit(2)
PY
[ -f "$archive.sha256" ] || { echo "checksum file missing" >&2; exit 2; }
(cd "$(dirname "$archive")" && sha256sum -c "$base.sha256") || { echo "archive checksum verification failed" >&2; exit 2; }
[ ! -e "$RIVERCLOUD_RESTORE_TARGET" ] || { echo "restore target must not already exist" >&2; exit 2; }
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec python3 "$script_dir/restore-safe.py" "$archive" "$RIVERCLOUD_RESTORE_TARGET"
