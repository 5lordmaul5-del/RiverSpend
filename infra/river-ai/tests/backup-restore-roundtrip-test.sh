#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"
TMP="$(mktemp -d)"
ENV_FILE="$ROOT/infra/river-ai/.env"
BACKUPS="$ROOT/infra/river-ai/backups"
ENV_CREATED=0
BACKUPS_CREATED=0
[[ -e "$ENV_FILE" ]] || ENV_CREATED=1
[[ -e "$BACKUPS" ]] || BACKUPS_CREATED=1
cleanup() {
  rm -rf "$TMP"
  if [[ "$ENV_CREATED" == 1 ]]; then rm -f "$ENV_FILE"; fi
  if [[ "$BACKUPS_CREATED" == 1 ]]; then rm -rf "$BACKUPS"; fi
}
trap cleanup EXIT
mkdir -p "$TMP/bin" "$ROOT/infra/river-ai"
if [[ "$ENV_CREATED" == 1 ]]; then touch "$ENV_FILE"; fi
if [[ "$BACKUPS_CREATED" == 1 ]]; then mkdir -p "$BACKUPS"; fi
printf 'synthetic postgres custom dump fixture\n' > "$TMP/dump.fixture"
cat > "$TMP/bin/docker" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail
if [[ "$*" == *"pg_dump"* ]]; then
  cat "$RIVER_TEST_FIXTURE"
elif [[ "$*" == *"pg_restore"* ]]; then
  if [[ "$*" == *"--list"* ]]; then
    cat >/dev/null
    echo "synthetic archive list"
  else
    cat > "$RIVER_TEST_RESTORED"
  fi
else
  echo "Unexpected docker shim invocation: $*" >&2
  exit 90
fi
EOF
chmod +x "$TMP/bin/docker"
export PATH="$TMP/bin:$PATH" RIVERBACKUP_PASSPHRASE="01234567890123456789012345678901" RIVER_TEST_FIXTURE="$TMP/dump.fixture" RIVER_TEST_RESTORED="$TMP/restored.fixture"
bash infra/river-ai/backup-owner-db.sh
backup="$(find "$BACKUPS" -name '*.dump.enc' -type f | head -n1)"
[[ -n "$backup" ]]
export RIVERBACKUP_FILE="$backup" RIVERBACKUP_TARGET_DB=rivercore_restore_test
bash infra/river-ai/restore-owner-db.sh
cmp "$TMP/dump.fixture" "$TMP/restored.fixture"
echo "Synthetic encrypted backup/restore round-trip passed."
