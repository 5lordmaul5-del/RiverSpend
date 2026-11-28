#!/usr/bin/env bash
set -Eeuo pipefail
BASE_URL="${RIVER_AI_BASE_URL:-http://127.0.0.1:8787}"
TOKEN="${RIVER_AI_ADMIN_TOKEN:-}"
if [[ -z "$TOKEN" ]]; then echo "Set RIVER_AI_ADMIN_TOKEN (not printed)." >&2; exit 2; fi
BASE_URL="${BASE_URL%/}"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
request() { curl --silent --show-error --max-time 8 -o "$tmp/body" -w '%{http_code}' "$@" ; }
# Health/readiness are public GET endpoints; either 200 or 503 is an explicit status.
status="$(request "$BASE_URL/health")"
[[ "$status" == 200 || "$status" == 503 ]] || { echo "/health unexpected status: $status"; exit 1; }
grep -Eq '"service":"RiverSSAI Independent Core"' "$tmp/body" || { echo "/health payload contract failed"; exit 1; }
status="$(request "$BASE_URL/ready")"
[[ "$status" == 200 || "$status" == 503 ]] || { echo "/ready unexpected status: $status"; exit 1; }
grep -Eq '"status":"(ready|not-ready)"' "$tmp/body" || { echo "/ready payload contract failed"; exit 1; }
# Authentication contract: reject missing/invalid credentials; allow owner token for agents GET.
status="$(request "$BASE_URL/v1/agents")"
[[ "$status" == 401 || "$status" == 429 ]] || { echo "Unauthenticated request was not rejected (status $status)"; exit 1; }
status="$(request -H 'Authorization: Bearer invalid-contract-test-token' "$BASE_URL/v1/agents")"
[[ "$status" == 401 || "$status" == 429 ]] || { echo "Invalid token was not rejected (status $status)"; exit 1; }
status="$(request -H "Authorization: Bearer $TOKEN" "$BASE_URL/v1/agents")"
[[ "$status" == 200 ]] || { echo "Owner token GET /v1/agents failed (status $status)"; exit 1; }
grep -Eq '"totalRoles":[0-9]+' "$tmp/body" || { echo "Agents payload contract failed"; exit 1; }
echo "Read-only RiverSSAI endpoint contract smoke test passed."
