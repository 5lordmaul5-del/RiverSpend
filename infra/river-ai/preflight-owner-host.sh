#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
echo "RiverSSAI owner-host preflight (read-only)"
for cmd in docker curl openssl df free awk; do
  if command -v "$cmd" >/dev/null 2>&1; then echo "$cmd: available"; else echo "$cmd: MISSING"; fi
done
if command -v docker >/dev/null 2>&1; then docker version --format 'Docker server: {{.Server.Version}}' 2>/dev/null || echo "Docker daemon unavailable"; docker compose version 2>/dev/null || echo "Compose plugin unavailable"; fi
if command -v df >/dev/null 2>&1; then df -h "$ROOT"; fi
if command -v free >/dev/null 2>&1; then free -h; fi
if [[ -f infra/river-ai/.env ]]; then
  mode="$(stat -c '%a' infra/river-ai/.env 2>/dev/null || echo unknown)"
  echo "Owner env file present; mode=$mode (values not displayed)"
else echo "Owner env file absent (bootstrap not yet run)."; fi
echo "Preflight only: no downloads, startup, writes, or credentials displayed."
