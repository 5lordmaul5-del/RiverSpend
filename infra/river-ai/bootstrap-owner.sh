#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="infra/river-ai/.env"
COMPOSE="infra/river-ai/docker-compose.yml"
echo "RiverSSAI owner bootstrap — configuration only; no containers are started."
for cmd in docker openssl; do command -v "$cmd" >/dev/null 2>&1 || { echo "Missing prerequisite: $cmd"; exit 1; }; done
docker compose version >/dev/null 2>&1 || { echo "Docker Compose plugin unavailable."; exit 1; }
if [[ -e "$ENV_FILE" ]]; then echo "Refusing to overwrite existing $ENV_FILE"; exit 1; fi
mkdir -p "$(dirname "$ENV_FILE")"
dbpass="$(openssl rand -hex 32)"
admintoken="$(openssl rand -hex 48)"
model="${RIVER_AI_LOCAL_MODEL:-qwen2.5:7b}"
cat > "$ENV_FILE" <<EOF
RIVERDB_PASSWORD=$dbpass
RIVER_AI_ADMIN_TOKEN=$admintoken
RIVER_AI_LOCAL_MODEL=$model
EOF
chmod 600 "$ENV_FILE"
unset dbpass admintoken
echo "Generated owner-only configuration at $ENV_FILE (permissions 0600). Secrets were not displayed."
if docker compose --env-file "$ENV_FILE" -f "$COMPOSE" config >/dev/null; then
  echo "Compose configuration renders successfully."
else
  echo "Compose validation failed. Configuration remains on disk; inspect locally without sharing secret values." >&2
  exit 1
fi
echo "Bootstrap complete. No services were started. Review the owner runbook before manually starting the runtime."
