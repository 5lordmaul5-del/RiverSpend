#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT="$(cd "$(dirname "$0")" && pwd)/verify-encrypted-backup.sh"
TMP="$(mktemp -d)"
trap 'rm -f "$TMP/test.dump.enc" "$TMP/test.dump.enc.sha256" "$TMP/test.dump.enc.hmac"; rmdir "$TMP"' EXIT
export RIVER_AI_BACKUP_PASSPHRASE='ci-test-passphrase'
B="$TMP/test.dump.enc"
printf 'synthetic encrypted backup fixture\n' > "$B"
sha256sum "$B" | awk '{print $1}' > "$B.sha256"
openssl dgst -sha256 -hmac "$RIVER_AI_BACKUP_PASSPHRASE" "$B" | awk '{print $NF}' > "$B.hmac"
bash "$SCRIPT" "$B"
# Alter content and ensure checksum mismatch is rejected.
printf 'tampered\n' >> "$B"
if bash "$SCRIPT" "$B" >/dev/null 2>&1; then echo 'Tampered file unexpectedly passed.' >&2; exit 1; fi
# Restore fixture, then corrupt HMAC and ensure it is rejected.
printf 'synthetic encrypted backup fixture\n' > "$B"
sha256sum "$B" | awk '{print $1}' > "$B.sha256"
printf 'bad-hmac\n' > "$B.hmac"
if bash "$SCRIPT" "$B" >/dev/null 2>&1; then echo 'Bad HMAC unexpectedly passed.' >&2; exit 1; fi
# Missing integrity metadata must fail closed.
rm -f "$B.hmac"
if bash "$SCRIPT" "$B" >/dev/null 2>&1; then echo 'Missing HMAC unexpectedly passed.' >&2; exit 1; fi
echo 'Integrity verifier positive and negative tests passed.'
