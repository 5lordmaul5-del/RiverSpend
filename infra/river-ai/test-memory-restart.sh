#!/usr/bin/env bash
# Verify durable memory survives API/container restart without deleting volumes.
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"
command -v curl >/dev/null || { echo "curl missing" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq missing" >&2; exit 1; }
[[ -f .env ]] || { echo ".env missing" >&2; exit 1; }
set -a; source .env; set +a
[[ ${#RIVER_AI_ADMIN_TOKEN} -ge 32 ]] || { echo "admin token invalid" >&2; exit 1; }
BASE="${RIVER_AI_BASE_URL:-http://127.0.0.1:8787}"
TITLE="restart-persistence-$(date +%s)"
CONTENT="Persistence verification marker $(date -u +%Y-%m-%dT%H:%M:%SZ)"
AUTH=(-H "Authorization: Bearer $RIVER_AI_ADMIN_TOKEN" -H "Content-Type: application/json")
echo "Writing marker to persistent memory..."
WRITE="$(curl --fail --silent --show-error -X POST "$BASE/v1/memories" "${AUTH[@]}" -d "$(jq -n --arg title "$TITLE" --arg content "$CONTENT" '{title:$title,content:$content,category:"recovery-test"}')")"
echo "$WRITE" | jq .
echo "Restarting application service only (volumes preserved)..."
docker compose restart river-ai
for i in $(seq 1 45); do
  if curl --fail --silent "$BASE/health" >/dev/null; then break; fi
  sleep 2
done
curl --fail --silent --show-error "$BASE/health" | jq .
echo "Querying memory marker after restart..."
CHAT="$(curl --fail --silent --show-error --max-time 100 -X POST "$BASE/v1/chat" "${AUTH[@]}" -d "$(jq -n --arg title "$TITLE" --arg content "$CONTENT" '{agent:"nova",messages:[{role:"user",content:"Conferma se nel contesto memoria trovi il marker "+$title+" e la frase "+$content+". Riporta esattamente marker e frase se presenti."}]}' )")"
echo "$CHAT" | jq .
echo "$CHAT" | jq -e --arg title "$TITLE" --arg content "$CONTENT" '.answer | contains($title) and contains($content)' >/dev/null
echo "PASS: marker memory retrieved after service restart."
