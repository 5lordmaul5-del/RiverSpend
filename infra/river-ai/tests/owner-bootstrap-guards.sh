#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT="infra/river-ai/start-owner-host.sh"
content="$(cat "$SCRIPT")"
if grep -Fq 'docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml' "$SCRIPT"; then
  echo "PASS compose uses generated private env file"
else
  echo "FAIL compose env file resolution" >&2; exit 1
fi
if grep -Fq 'docker compose -f infra/river-ai/docker-compose.yml' "$SCRIPT"; then
  echo "FAIL compose invocation missing explicit env file" >&2; exit 1
fi
if grep -Fq 'if [[ -f "$ENV_FILE" ]]' "$SCRIPT" && grep -Fq 'Refusing to overwrite existing' "$SCRIPT"; then
  echo "PASS bootstrap refuses overwrite"
else
  echo "FAIL overwrite guard" >&2; exit 1
fi
if grep -Fq 'chmod 600 "$ENV_FILE"' "$SCRIPT"; then
  echo "PASS private env permissions"
else
  echo "FAIL env permissions" >&2; exit 1
fi
