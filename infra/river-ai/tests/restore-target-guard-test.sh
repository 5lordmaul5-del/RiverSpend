#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SCRIPT="$ROOT/infra/river-ai/restore-owner-db.sh"
TMP="$(mktemp -d)"
ENV_CREATED=0\nif [[ ! -e "$ROOT/infra/river-ai/.env" ]]; then ENV_CREATED=1; fi\ncleanup() { rm -rf "$TMP"; if [[ "$ENV_CREATED" == 1 ]]; then rm -f "$ROOT/infra/river-ai/.env"; fi; }\ntrap cleanup EXIT
mkdir -p "$TMP/bin" "$ROOT/infra/river-ai"
# Isolate docker and crypto/checksum commands; guard must fail before any of these run.
cat > "$TMP/bin/docker" <<'EOF'
#!/usr/bin/env bash
echo docker-called >&2
exit 99
EOF
chmod +x "$TMP/bin/docker"
if [[ ! -e "$ROOT/infra/ai/.env" ]]; then touch "$ROOT/infra/river-ai/.env"; fi
export PATH="$TMP/bin:$PATH" RIVERBACKUP_PASSPHRASE="01234567890123456789012345678901" RIVERBACKUP_FILE="$TMP/no-file" 
for target in rivercore wrongname; do
  export RIVERBACKUP_TARGET_DB="$target"
  if bash "$SCRIPT" >"$TMP/out" 2>"$TMP/err"; then
    echo "Expected refusal for target: $target" >&2; exit 1
  fi
  grep -q "Refusing restore into primary database rivercore\|Restore target must use the rivercore_restore_ prefix" "$TMP/err"
  ! grep -q docker-called "$TMP/err"
done
export RIVERBACKUP_TARGET_DB=rivercore_restore_test
# A valid prefixed target must pass the target guard and advance to backup validation.
if bash "$SCRIPT" >"$TMP/out" 2>"$TMP/err"; then
  echo "Unexpected restore success without backup files" >&2; exit 1
fi
grep -q "Backup, checksum, and HMAC files are required" "$TMP/err"
echo "Restore target guard tests passed."
