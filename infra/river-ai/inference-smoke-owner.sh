#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="infra/river-ai/.env"
COMPOSE="infra/river-ai/docker-compose.yml"
if [[ ! -f "$ENV_FILE" ]]; then echo "Owner bootstrap required."; exit 2; fi
mode="$(stat -c '%a' "$ENV_FILE")"
if [[ "$mode" != "600" && "$mode" != "400" ]]; then echo "Unsafe env permissions."; exit 2; fi
if [[ -z "${RIVERAI_SMOKE_MODEL:-}" ]]; then echo "Set RIVERAI_SMOKE_MODEL to an already-installed model name. No default model or download."; exit 2; fi
echo "Running bounded, non-streaming local inference smoke test against installed model."
timeout "${RIVERAI_SMOKE_TIMEOUT:-60}s" docker compose --env-file "$ENV_FILE" -f "$COMPOSE" exec -T ollama ollama run "$RIVERAI_SMOKE_MODEL" "Reply with exactly: RiverSSAI local inference test OK" --nowordwrap
