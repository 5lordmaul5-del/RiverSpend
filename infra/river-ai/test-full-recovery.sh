#!/usr/bin/env bash
# Milestone 7: full compose restart, readiness and durable-memory recovery.
# Preserves volumes; never runs down -v or deletes data.
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"
for bin in docker curl jq; do command -v "$bin" >/dev/null || { echo "Missing prerequisite: $bin" >&2; exit 1; }; done
docker compose version >/dev/null
[[ -f .env ]] || { echo ".env missing" >&2; exit 1; }
set -a; source .env; set +a
[[ ${#RIVER_AI_ADMIN_TOKEN} -ge 32 ]] || { echo "Admin token invalid" >&2; exit 1; }
BASE="${RIVER_AI_BASE_URL:-http://127.0.0.1:8787}"
AUTH=(-H "Authorization: Bearer $RIVER_AI_ADMIN_TOKEN" -H "Content-Type: application/json")
TITLE="full-stack-recovery-$(date +%s)"
CONTENT="RiverSSAI recovery marker $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "1/5 Write durable marker..."
curl --fail --silent --show-error -X POST "$BASE/v1/memories" "${AUTH[@]}" -d "$(jq -n --arg title "$TITLE" --arg content "$CONTENT" '{title:$title,content:$content,category:"recovery-test"}')" | jq .
echo "2/5 Restart all services (volumes retained)..."
docker compose restart
echo "3/5 Wait for health and model readiness..."
READY=0
for i in $(seq 1 90); do
  if curl --fail --silent "$BASE/ready" >/dev/null 2>&1; then READY=1; break; fi
  sleep 2
done
[[ $READY -eq 1 ]] || { docker compose ps; docker compose logs --tail=100; echo "Readiness timeout" >&2; exit 1; }
curl --fail --silent --show-error "$BASE/health" | jq .
curl --fail --silent --show-error "$BASE/ready" | jq .
echo "4/5 Ask Nova to recover the marker..."
CHAT="$(curl --fail --silent --show-error --max-time 100 -X POST "$BASE/v1/chat" "${AUTH[@]}" -d "$(jq -n --arg title "$TITLE" --arg content "$CONTENT" '{agent:"nova",messages:[{role:"user",content:"Riporta esattamente il marker "+$title+" e la frase "+$content+" che hai nella memoria persistente."}]}' )")"
echo "$CHAT" | jq .
echo "$CHAT" | jq -e --arg title "$TITLE" --arg content "$CONTENT" '.answer | contains($title) and contains($content)' >/dev/null
echo "5/5 PASS: full-stack restart, readiness and memory recovery verified."
