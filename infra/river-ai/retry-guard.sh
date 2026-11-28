#!/usr/bin/env bash
set -Eeuo pipefail
# Generic bounded retry wrapper for owner scripts; does not run unless invoked.
if [[ $# -lt 1 ]]; then echo "Usage: retry-guard.sh command [args...]" >&2; exit 2; fi
attempts="${RIVERAI_RETRY_ATTEMPTS:-3}"
delay="${RIVERAI_RETRY_DELAY_SECONDS:-2}"
timeout_s="${RIVERAI_RETRY_TIMEOUT_SECONDS:-30}"
[[ "$attempts" =~ ^[1-5]$ ]] || { echo "Attempts must be 1..5" >&2; exit 2; }
[[ "$delay" =~ ^[0-9]+$ ]] || { echo "Delay must be non-negative integer" >&2; exit 2; }
[[ "$timeout_s" =~ ^[1-9][0-9]*$ ]] || { echo "Timeout must be positive integer" >&2; exit 2; }
command -v timeout >/dev/null 2>&1 || { echo "GNU timeout required" >&2; exit 3; }
for ((i=1;i<=attempts;i++)); do
  echo "Attempt $i/$attempts"
  if timeout "${timeout_s}s" "$@"; then exit 0; fi
  rc=$?
  if [[ "$rc" -eq 124 || "$rc" -eq 137 ]]; then echo "Attempt timed out or was terminated." >&2; fi
  if [[ "$i" -lt "$attempts" ]]; then sleep "$delay"; fi
done
echo "Retry budget exhausted; no further retries." >&2
exit 1
