#!/usr/bin/env bash
set -Eeuo pipefail
BACKUP="${1:-}"
if [[ -z "$BACKUP" || ! -f "$BACKUP" ]]; then echo "Usage: $0 backup-file.dump.enc" >&2; exit 2; fi
if [[ -z "${RIVER_AI_BACKUP_PASSPHRASE:-}" ]]; then echo "Set RIVER_AI_BACKUP_PASSPHRASE." >&2; exit 1; fi
command -v sha256sum >/dev/null || { echo "sha256sum required." >&2; exit 1; }
command -v python3 >/dev/null || { echo "python3 required for backup HMAC." >&2; exit 1; }
if [[ ! -f "$BACKUP.sha256" || ! -f "$BACKUP.hmac" ]]; then echo "Integrity sidecars missing; refusing verification." >&2; exit 1; fi
EXPECTED_SHA="$(awk '{print $1}' "$BACKUP.sha256")"
ACTUAL_SHA="$(sha256sum "$BACKUP" | awk '{print $1}')"
if [[ -z "$EXPECTED_SHA" || "$EXPECTED_SHA" != "$ACTUAL_SHA" ]]; then echo "Checksum failed." >&2; exit 1; fi
EXPECTED_HMAC="$(awk '{print $NF}' "$BACKUP.hmac")"
ACTUAL_HMAC="$(python3 "$(dirname "$0")/hmac_sha256.py" "$BACKUP")"
if [[ -z "$EXPECTED_HMAC" || "$EXPECTED_HMAC" != "$ACTUAL_HMAC" ]]; then echo "HMAC authentication failed." >&2; exit 1; fi
echo "Backup integrity verified (SHA-256 and HMAC). No decryption or restore performed."
