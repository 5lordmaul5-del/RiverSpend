#!/usr/bin/env bash
# Endpoint guard tests: authentication, bounded memory listing, and rejection.
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"
command -v curl >/dev/null || { echo "curl missing" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq missing" >&2; exit 1; }
[[ -f .env ]] || { echo ".env missing" >&2; exit 1; }
set -a; source .env; set +a
[[ ${#RIVER_AI_ADMIN_TOKEN} -ge 32 ]] || { echo "admin token invalid" >&2; exit 1; }
BASE="${RIVER_AI_BASE_URL:-http://127.0.0.1:8787}"
echo "Checking auth rejection..."
STATUS="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE/v1/memories?limit=5")"
[[ "$STATUS" == "401" ]] || { echo "expected 401 unauthenticated, got $STATUS" >&2; exit 1; }
echo "Checking bounded authenticated memory endpoint..."
curl --fail --silent --show-error "$BASE/v1/memories?limit=500" -H "Authorization: Bearer $RIVER_AI_ADMIN_TOKEN" | jq -e '.count <= 50 and (.memories | length <= 50)' >/dev/null
echo "PASS: unauthenticated request rejected; listing capped at 50."
