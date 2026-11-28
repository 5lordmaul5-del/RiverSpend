#!/usr/bin/env bash
set -Eeuo pipefail
COMPOSE=infra/river-ai/docker-compose.yml
export RIVERDB_PASSWORD='validation-only-placeholder'
export RIVER_AI_ADMIN_TOKEN='validation-only-placeholder'
echo "Validate compose syntax and service isolation"
docker compose -f "$COMPOSE" config >/dev/null
rendered="$(docker compose -f "$COMPOSE" config)"
for service in riverdb ollama river-ai-worker river-ai; do
  grep -F "$service:" <<< "$rendered" >/dev/null || { echo "Missing service: $service"; exit 1; }
done
grep -F '127.0.0.1:8787:8787' <<< "$rendered" >/dev/null
grep -F 'river-private' <<< "$rendered" >/dev/null
grep -F 'ollama-egress' <<< "$rendered" >/dev/null
if grep -E '0\.0\.0\.0:|:::8787' <<< "$rendered"; then
  echo "Unexpected non-loopback published port found"; exit 1
fi
echo "Compose validation passed (placeholder credentials only)."
