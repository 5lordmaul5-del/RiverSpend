#!/usr/bin/env bash
set -Eeuo pipefail
# Generic bounded retry wrapper for owner scripts; does not run unless invoked.
if [[ $# -lt 1 ]]; then echo "Usage: retry-guard.sh command [args...]" >&2; exit 2; fi
attempts="${RIVERAI_RETRY_ATTEMPTS:-3}"
delay="${RIVERAI_RETRY_DELAY_SECONDS:-2}"
timeout_s="${RIVERAI_RETRY_TIMEOUT_SECONDS:-30}"
[[ "$attempts" =~ ^[1-5]$ ]] || { echo "Attempts must be 1..5" >&2; exit 2; }
[[ "$delay" =~ ^([0-9]|[1-2][0-9]|30)$ ]] || { echo "Delay must be 0..30 seconds" >&2; exit 2; }
[[ "$timeout_s" =~ ^([1-9][0-9]?|[1-2][0-9][0-9]|300)$ ]] || { echo "Timeout must be 1..300 seconds" >&2; exit 2; }
command -v timeout >/dev/null 2>&1 || { echo "GNU timeout required" >&2; exit 3; }
for ((i=1;i<=attempts;i++)); do
  echo "Attempt $i/$attempts"
  set +e
  timeout "${timeout_s}s" "$@"
  rc=$?
  set -e
  if [[ "$rc" -eq 0 ]]; then exit 0; fi
  if [[ "$rc" -eq 124 || "$rc" -eq 137 ]]; then echo "Attempt timed out or was terminated." >&2; else echo "Attempt failed with status $rc." >&2; fi
  if [[ "$i" -lt "$attempts" ]]; then sleep "$delay"; fi
done
echo "Retry budget exhausted; no further retries." >&2
exit 1
