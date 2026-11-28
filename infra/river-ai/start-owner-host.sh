#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="infra/river-ai/.env"
MODEL="${RIVER_AI_LOCAL_MODEL:-qwen2.5:7b}"
command -v docker >/dev/null 2>&1 || { echo "Docker is required." >&2; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "curl is required." >&2; exit 1; }
command -v openssl >/dev/null 2>&1 || { echo "openssl is required." >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "Docker Compose plugin is required." >&2; exit 1; }
if [[ -f "$ENV_FILE" ]]; then echo "Refusing to overwrite existing $ENV_FILE." >&2; exit 1; fi
umask 077
DB_PASSWORD="$(openssl rand -hex 32)"
ADMIN_TOKEN="$(openssl rand -hex 32)"
cat > "$ENV_FILE" <<EOF
RIVERDB_PASSWORD=$DB_PASSWORD
RIVER_AI_ADMIN_TOKEN=$ADMIN_TOKEN
RIVER_AI_LOCAL_MODEL=$MODEL
RIVER_AI_MAX_REQUESTS_PER_MINUTE=20
RIVER_AI_MAX_PARALLEL=1
EOF
chmod 600 "$ENV_FILE"
echo "Created private runtime environment."
docker compose -f infra/river-ai/docker-compose.yml up -d --build riverdb ollama river-ai
echo "Waiting for Ollama..."
for i in {1..120}; do
  if docker compose -f infra/river-ai/docker-compose.yml exec -T ollama ollama list >/dev/null 2>&1; then break; fi
  sleep 2
done
docker compose -f infra/river-ai/docker-compose.yml exec -T ollama ollama pull "$MODEL"
docker compose -f infra/river-ai/docker-compose.yml up -d river-ai-worker
API="http://127.0.0.1:8787"
echo "Waiting for readiness..."
ready=0
for i in {1..90}; do
  if curl --silent --fail "$API/ready" >/dev/null; then ready=1; break; fi
  sleep 2
done
if [[ "$ready" != "1" ]]; then echo "Readiness failed. Inspect Docker logs." >&2; exit 1; fi
echo "Running local authenticated smoke test..."
SMOKE_FILE="$(mktemp)"
trap 'rm -f "$SMOKE_FILE"' EXIT
curl --silent --show-error --fail -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Rispondi solo: RiverSSAI test riuscito."}]}' "$API/v1/chat" > "$SMOKE_FILE"
if ! grep -q '"provider":"local"' "$SMOKE_FILE"; then echo "Local-provider smoke-test confirmation missing." >&2; exit 1; fi
echo "RiverSSAI ready; local-model smoke test passed. API bound to localhost."
echo "Secret is stored in infra/river-ai/.env (mode 0600); do not share."
echo "Stop: docker compose -f infra/river-ai/docker-compose.yml down"
echo "Restart: docker compose -f infra/river-ai/docker-compose.yml up -d"
