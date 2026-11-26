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
[ -f "$archive.sha256" ] && [ ! -L "$archive.sha256" ] || { echo "checksum file missing or unsafe" >&2; exit 2; }
python3 - "$archive" "$archive.sha256" "$base" <<'PY'
import hashlib, os, re, sys
archive, sidecar, expected_name = sys.argv[1:]
try:
 with open(sidecar, "r", encoding="ascii") as f:
  lines = f.readlines()
 if len(lines) != 1:
  raise ValueError
 match = re.fullmatch(r"([0-9a-fA-F]{64})[ \\t]+(?:\\*?)([^\\n]+)\\n?", lines[0])
 if not match or match.group(2) != expected_name:
  raise ValueError
 digest = hashlib.sha256()
 with open(archive, "rb") as f:
  for chunk in iter(lambda: f.read(1024*1024), b""):
   digest.update(chunk)
 if digest.hexdigest().lower() != match.group(1).lower():
  print("archive checksum verification failed", file=sys.stderr)
  raise SystemExit(2)
except (OSError, UnicodeError, ValueError):
 print("archive checksum sidecar invalid or checksum verification failed", file=sys.stderr)
 raise SystemExit(2)
PY
[ ! -e "$RIVERCLOUD_RESTORE_TARGET" ] || { echo "restore target must not already exist" >&2; exit 2; }
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec python3 "$script_dir/restore-safe.py" "$archive" "$RIVERCLOUD_RESTORE_TARGET"
