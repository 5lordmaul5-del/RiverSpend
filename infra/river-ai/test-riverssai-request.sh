#!/usr/bin/env bash
# Smoke test for Milestones 3-4: authenticated local request -> model response.
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"
command -v curl >/dev/null || { echo "curl missing" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq missing" >&2; exit 1; }
[[ -f .env ]] || { echo ".env missing" >&2; exit 1; }
set -a; source .env; set +a
[[ ${#RIVER_AI_ADMIN_TOKEN} -ge 32 ]] || { echo "admin token invalid" >&2; exit 1; }
BASE="${RIVER_AI_BASE_URL:-http://127.0.0.1:8787}"
echo "1/3: health check"
curl --fail --silent --show-error "$BASE/health" | jq .
echo "2/3: readiness check (model must be present)"
curl --fail --silent --show-error "$BASE/ready" | jq .
echo "3/3: authenticated model request"
RESPONSE="$(curl --fail --silent --show-error --max-time 100 -X POST "$BASE/v1/chat" \
  -H "Authorization: Bearer $RIVER_AI_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agent":"nova","messages":[{"role":"user","content":"Rispondi solo: RiverSSAI test riuscito."}]}')"
echo "$RESPONSE" | jq .
echo "$RESPONSE" | jq -e '.answer | type == "string" and length > 0' >/dev/null
echo "$RESPONSE" | jq -e '.provider == "local" and .memory == "saved"' >/dev/null
echo "PASS: request received, local response returned and memory write reported."
