#!/usr/bin/env bash
# RiverSSAI deterministic local startup; retains all named volumes.
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"
fail(){ printf 'ERRORE: %s\\n' "$*" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || fail "Docker non installato."
command -v curl >/dev/null 2>&1 || fail "curl non installato."
docker compose version >/dev/null 2>&1 || fail "Docker Compose plugin non disponibile."
[[ -f .env ]] || fail "File .env mancante. Copia .env.example in .env e imposta i segreti."
set -a
source .env
set +a
[[ -n "${RIVERDB_PASSWORD:-}" && "${RIVERDB_PASSWORD:-}" != "replace-with-long-random-password" ]] || fail "RIVERDB_PASSWORD non configurata."
[[ -n "${RIVER_AI_ADMIN_TOKEN:-}" && "${RIVER_AI_ADMIN_TOKEN:-}" != "replace-with-at-least-32-random-characters" ]] || fail "RIVER_AI_ADMIN_TOKEN non configurato."
[[ ${#RIVER_AI_ADMIN_TOKEN} -ge 32 ]] || fail "RIVER_AI_ADMIN_TOKEN deve contenere almeno 32 caratteri."
docker compose config >/dev/null || fail "Configurazione Compose non valida."
docker compose up -d --build riverdb ollama river-ai
MODEL="${RIVER_AI_LOCAL_MODEL:-qwen2.5:7b}"
printf "Verifico modello Ollama: %s\\n" "$MODEL"
if ! docker compose exec -T ollama ollama list 2>/dev/null | awk 'NR>1 {print $1}' | grep -Fxq "$MODEL"; then
  printf "Modello assente: avvio download %s (può richiedere tempo e spazio).\\n" "$MODEL"
  docker compose exec -T ollama ollama pull "$MODEL" || fail "Download modello fallito."
fi
printf 'Attendo RiverSSAI healthcheck...\\n'
for i in $(seq 1 60); do
  if curl --silent --fail http://127.0.0.1:8787/health >/dev/null 2>&1; then
    printf 'RiverSSAI avviata. Health: '
    curl --silent --show-error http://127.0.0.1:8787/health
    printf '\\nReadiness (modello incluso): '
    curl --silent --show-error http://127.0.0.1:8787/ready || true
    printf '\\n'
    exit 0
  fi
  sleep 2
done
docker compose ps
docker compose logs --tail=80 river-ai riverdb ollama
fail "Timeout: RiverSSAI non ha superato il healthcheck."
