#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
COMPOSE="infra/river-ai/docker-compose.yml"
ENV_FILE="infra/river-ai/.env"
if [[ ! -f "$ENV_FILE" ]]; then echo "Owner configuration missing. Run Point 8 bootstrap first."; exit 2; fi
if [[ "$(stat -c '%a' "$ENV_FILE")" != "600" && "$(stat -c '%a' "$ENV_FILE")" != "400" ]]; then echo "Unsafe .env permissions; require 0600 or 0400."; exit 2; fi
docker compose --env-file "$ENV_FILE" -f "$COMPOSE" config >/dev/null
echo "Configuration valid. Starting RiverSSAI services (explicit local command)."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE" up -d riverdb ollama river-ai-worker river-ai
echo "Services requested to start. Use diagnostics and read-only contract smoke test to inspect readiness."
