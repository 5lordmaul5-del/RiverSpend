#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
COMPOSE="infra/river-ai/docker-compose.yml"
ENV_FILE="infra/river-ai/.env"
API="http://127.0.0.1:8787"
echo "RiverSSAI safe diagnostics (no secrets or logs printed)"
echo "== prerequisites =="
for cmd in docker curl df stat; do
  if command -v "$cmd" >/dev/null 2>&1; then echo "$cmd: available"; else echo "$cmd: MISSING"; fi
done
if ! docker compose version >/dev/null 2>&1; then echo "Docker Compose unavailable; stopping diagnostics."; exit 1; fi
echo "== environment file =="
if [[ -f "$ENV_FILE" ]]; then
  perms="$(stat -c '%a' "$ENV_FILE")"
  echo "env file exists; permissions=$perms"
  if [[ "$perms" != "600" && "$perms" != "400" ]]; then echo "WARNING: environment file permissions are broader than 0600."; fi
else
  echo "env file missing: runtime setup has not been completed."
fi
echo "== service state =="
docker compose -f "$COMPOSE" ps --format 'table {{.Service}}\t{{.State}}\t{{.Status}}'
echo "== disk =="
df -h "$ROOT"
echo "== localhost endpoints (HTTP status only) =="
for endpoint in /health /ready; do
  status="$(curl --silent --output /dev/null --write-out '%{http_code}' --max-time 5 "$API$endpoint" || true)"
  [[ -n "$status" ]] || status="no-response"
  echo "$endpoint: $status"
done
echo "Diagnostics completed. No credential values or service logs were displayed."
