#!/usr/bin/env bash
# RiverSSAI milestone 1: deterministic local startup and health verification.
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

fail() { printf 'ERRORE: %s\n' "$*" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || fail "Docker non installato."
docker compose version >/dev/null 2>&1 || fail "Docker Compose plugin non disponibile."
[[ -f .env ]] || fail "File .env mancante. Copia .env.example in .env e imposta i segreti."
set -a; source .env; set +a
[[ "${RIVERDB_PASSWORD:-}" != "" && "${RIVERDB_PASSWORD:-}" != "replace-with-long-random-password" ]] || fail "RIVERDB_PASSWORD non configurata."
[[ "${RIVER_AI_ADMIN_TOKEN:-}" != "" && "${RIVER_AI_ADMIN_TOKEN:-}" != "replace-with-at-least-32-random-characters" ]] || fail "RIVER_AI_ADMIN_TOKEN non configurato."
[[ ${#RIVER_AI_ADMIN_TOKEN} -ge 32 ]] || fail "RIVER_AI_ADMIN_TOKEN deve contenere almeno 32 caratteri."

docker compose config >/dev/null || fail "Configurazione Compose non valida."
docker compose up -d --build riverdb ollama river-ai

printf 'Attendo RiverSSAI healthcheck...\n'
for i in $(seq 1 60); do
  if curl --silent --show-error --fail http://127.0.0.1:8787/health >/dev/null 2>&1; then
    printf 'RiverSSAI avviata. Health: '
    curl --silent --show-error http://127.0.0.1:8787/health
    printf '\n'
    printf 'Readiness (modello incluso): '
    curl --silent --show-error http://127.0.0.1:8787/ready || true
    printf '\n'
    exit 0
  fi
  sleep 2
done
docker compose ps
docker compose logs --tail=80 river-ai riverdb ollama
fail "Timeout: RiverSSAI non ha superato il healthcheck."
