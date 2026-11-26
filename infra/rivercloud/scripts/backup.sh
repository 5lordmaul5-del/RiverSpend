#!/usr/bin/env sh
set -eu
: "${RIVERCLOUD_DATA_DIR:?Set RIVERCLOUD_DATA_DIR to the data directory}"
: "${RIVERCLOUD_BACKUP_DIR:?Set RIVERCLOUD_BACKUP_DIR to a separate backup directory}"
[ -d "$RIVERCLOUD_DATA_DIR" ] || { echo "data directory missing" >&2; exit 2; }
DATA_DIR=$(cd "$RIVERCLOUD_DATA_DIR" && pwd -P)
case "$DATA_DIR" in /) echo "root data directory is not supported" >&2; exit 2;; esac
# Keep newly created backup directories private; never silently repair an existing directory.
umask 077
mkdir -p "$RIVERCLOUD_BACKUP_DIR"
BACKUP_DIR=$(cd "$RIVERCLOUD_BACKUP_DIR" && pwd -P)
backup_owner=$(stat -c '%u' "$BACKUP_DIR")
backup_mode=$(stat -c '%a' "$BACKUP_DIR")
backup_uid=$(id -u)
backup_mode_bits=$((0$backup_mode))
if [ "$backup_owner" != "$backup_uid" ] || [ $((backup_mode_bits & 077)) -ne 0 ] || [ $((backup_mode_bits & 0700)) -ne 0700 ]; then
  echo "backup directory must be owned by current user and have private 0700 permissions" >&2
  exit 2
fi
case "$BACKUP_DIR" in "$DATA_DIR"|"$DATA_DIR"/*) echo "backup directory must be outside the data directory" >&2; exit 2;; esac
if find "$DATA_DIR" -mindepth 1 ! -type d ! -type f -print -quit | grep -q .; then echo "unsupported entry types (symlinks and special files) in data directory" >&2; exit 2; fi
if find "$DATA_DIR" -type f -links +1 -print -quit | grep -q .; then echo "hardlinked files in data directory are not supported" >&2; exit 2; fi
if find "$DATA_DIR" -type f \( -name "*.lock" -o -name "*.tmp-*" \) -print -quit | grep -q .; then echo "transaction lock or temporary file present; quiesce and retry" >&2; exit 2; fi
base="rivercloud-data-$(date -u +%Y%m%dT%H%M%SZ)-$$.tar.gz"
archive="$BACKUP_DIR/$base"
tmp_archive=$(mktemp "$BACKUP_DIR/.rivercloud-archive.XXXXXX")
tmp_checksum=$(mktemp "$BACKUP_DIR/.rivercloud-checksum.XXXXXX")
cleanup() {
  rm -f "$tmp_archive" "$tmp_checksum"
  if [ "${published_archive:-}" = "yes" ] && [ "${published_checksum:-}" != "yes" ]; then rm -f "$archive"; fi
}
trap cleanup EXIT HUP INT TERM
tar --exclude="*.lock" --exclude="*.tmp-*" -czf "$tmp_archive" -C "$DATA_DIR" .
mv "$tmp_archive" "$archive"
published_archive=yes
(cd "$BACKUP_DIR" && sha256sum "$base") > "$tmp_checksum"
mv "$tmp_checksum" "$archive.sha256"
published_checksum=yes
printf '%s\n' "$archive"
