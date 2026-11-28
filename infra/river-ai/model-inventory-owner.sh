#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="infra/river-ai/.env"
if [[ ! -f "$ENV_FILE" ]]; then echo "Bootstrap first: owner env file absent."; exit 2; fi
if [[ "$(stat -c '%a' "$ENV_FILE")" != "600" && "$(stat -c '%a' "$ENV_FILE")" != "400" ]]; then echo "Unsafe .env mode; expected 0600/0400."; exit 2; fi
if ! command -v ollama >/dev/null 2>&1; then echo "Ollama CLI not installed on host. Runtime container may provide it; this planner does not install."; exit 3; fi
echo "Available local models:"
ollama list
echo "This inventory operation is read-only; no model is pulled or changed."
