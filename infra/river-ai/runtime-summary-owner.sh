#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="infra/river-ai/.env"
COMPOSE="infra/river-ai/docker-compose.yml"
[[ -f "$ENV_FILE" ]] || { echo "Owner configuration missing."; exit 2; }
mode="$(stat -c '%a' "$ENV_FILE")"
[[ "$mode" == "600" || "$mode" == "400" ]] || { echo "Unsafe env file permissions."; exit 2; }
echo "Service state summary:"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE" ps --format 'table {{.Service}}\t{{.State}}\t{{.Health}}'
echo
echo "Health endpoints (HTTP status only; response bodies suppressed):"
for endpoint in http://127.0.0.1:3000/health http://127.0.0.1:3000/ready; do
  status="$(curl --silent --output /dev/null --write-out '%{http_code}' --max-time 5 "$endpoint" || true)"
  [[ -n "$status" ]] || status="000"
  printf '%s %s\n' "$endpoint" "$status"
done
echo "Summary only: no logs, response bodies, prompts, credentials or database content printed."
