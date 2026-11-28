#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
echo "RiverSSAI owner-host preflight"
fail=0
check() { if "$@" >/dev/null 2>&1; then printf '[PASS] %s\n' "$1"; else printf '[FAIL] %s\n' "$1"; fail=1; fi; }
command -v docker >/dev/null 2>&1 || { echo "[FAIL] Docker CLI missing"; fail=1; }
command -v curl >/dev/null 2>&1 || { echo "[FAIL] curl missing"; fail=1; }
command -v openssl >/dev/null 2>&1 || { echo "[FAIL] openssl missing"; fail=1; }
if command -v docker >/dev/null 2>&1; then
  check "Docker daemon reachable" docker info
  check "Docker Compose available" docker compose version
fi
if [[ -f infra/river-ai/.env ]]; then
  echo "[INFO] Private environment file exists; contents will not be displayed."
else
  echo "[INFO] Environment file not created yet. The startup script will create it."
fi
if [[ -f infra/river-ai/docker-compose.yml ]]; then
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    if [[ -f infra/river-ai/.env ]]; then
      check "Compose configuration validates" docker compose --env-file infra/river-ai/.env -f infra/river-ai/docker-compose.yml config -q
    else
      echo "[INFO] Compose validation deferred until private .env is created."
    fi
  fi
else
  echo "[FAIL] Compose file missing"; fail=1
fi
if command -v df >/dev/null 2>&1; then
  echo "[INFO] Disk space (for owner assessment):"
  df -h "$ROOT"
fi
if [[ "$fail" -eq 0 ]]; then
  echo "Preflight checks passed. Host-specific RAM/GPU/model performance still requires measurement."
else
  echo "One or more prerequisite checks failed. Resolve them before starting RiverSSAI." >&2
fi
exit "$fail"
