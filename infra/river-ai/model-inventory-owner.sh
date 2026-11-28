#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="infra/river-ai/.env"
COMPOSE="infra/river-ai/docker-compose.yml"
if [[ ! -f "$ENV_FILE" ]]; then echo "Bootstrap first: owner env file absent."; exit 2; fi
if [[ "$(stat -c '%a' "$ENV_FILE")" != "600" && "$(stat -c '%a' "$ENV_FILE")" != "400" ]]; then echo "Unsafe .env mode; expected 0600/0400."; exit 2; fi
if ! command -v docker >/dev/null 2>&1; then echo "Docker CLI unavailable."; exit 3; fi
echo "Inventory from the local Ollama service container (requires service running):"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE" exec -T ollama ollama list
echo "Read-only inventory; no model is pulled or changed."
