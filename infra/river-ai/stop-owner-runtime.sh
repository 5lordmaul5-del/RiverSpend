#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
COMPOSE="infra/river-ai/docker-compose.yml"
ENV_FILE="infra/river-ai/.env"
if [[ ! -f "$ENV_FILE" ]]; then echo "Owner configuration missing."; exit 2; fi
echo "Stopping the local RiverSSAI Compose services without removing volumes."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE" stop river-ai river-ai-worker ollama riverdb
echo "Services stopped. Persistent volumes were not removed."
