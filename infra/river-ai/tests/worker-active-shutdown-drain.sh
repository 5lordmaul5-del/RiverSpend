#!/usr/bin/env bash
set -euo pipefail
: "${PGHOST:=localhost}" "${PGPORT:=5432}" "${PGDATABASE:=rivercore}" "${PGUSER:=rivercore}" "${PGPASSWORD:=rivercore-test}"
export PGPASSWORD
TOKEN="river-ai-active-shutdown-test-token-0123456789"
MODEL="test-model"
API_PID="" WORKER_PID="" MOCK_PID=""
cleanup(){ for pid in "$WORKER_PID" "$API_PID" "$MOCK_PID"; do if [[ -n "$pid" ]]; then kill "$pid" 2>/dev/null || true; fi; done; }
trap cleanup EXIT
psql -q -v ON_ERROR_STOP=1 -f infra/river-ai/schema.sql
psql -q -v ON_ERROR_STOP=1 -f infra/river-ai/worker-queue.sql
RIVER_AI_LOCAL_MODEL="$MODEL" RIVER_AI_MOCK_DELAY_MS=5000 node infra/river-ai/tests/mock-model.mjs &
MOCK_PID=$!
DATABASE_URL="postgres://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE" RIVER_AI_ADMIN_TOKEN="$TOKEN" RIVER_AI_LOCAL_URL="http://127.0.0.1:11434/v1/chat/completions" RIVER_AI_LOCAL_MODEL="$MODEL" PORT=8787 node server/river-ai-standalone.mjs &
API_PID=$!
DATABASE_URL="postgres://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE" RIVER_AI_LOCAL_URL="http://127.0.0.1:11434/v1/chat/completions" RIVER_AI_LOCAL_MODEL="$MODEL" RIVER_AI_WORKER_POLL_MS=500 node server/river-ai-worker.mjs &
WORKER_PID=$!
for i in {1..40}; do if curl -fsS http://127.0.0.1:8787/health >/dev/null && curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; then break; fi; sleep 1; done
curl -fsS http://127.0.0.1:8787/ready >/dev/null
response="$(curl -fsS -X POST http://127.0.0.1:8787/v1/jobs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"agentKey":"nova","task":"ACTIVE_SHUTDOWN_DRAIN_TEST"}')"
job_id="$(node -e 'const x=JSON.parse(process.argv[1]); console.log(x.job.id)' "$response")"
claimed=0
for i in {1..20}; do
  status="$(psql -Atq -v ON_ERROR_STOP=1 -c "SELECT status FROM river_ai_jobs WHERE id='$job_id'")"
  if [[ "$status" == "running" ]]; then claimed=1; break; fi
  sleep .25
done
if [[ "$claimed" != "1" ]]; then echo "Worker did not claim synthetic job" >&2; exit 1; fi
kill -TERM "$WORKER_PID"
for i in {1..20}; do
  if ! kill -0 "$WORKER_PID" 2>/dev/null || ps -o stat= -p "$WORKER_PID" 2>/dev/null | awk '$1 ~ /^Z/ {found=1} END {exit !found}'; then break; fi
  sleep 1
done
if kill -0 "$WORKER_PID" 2>/dev/null && ! ps -o stat= -p "$WORKER_PID" 2>/dev/null | awk '$1 ~ /^Z/ {found=1} END {exit !found}'; then
  echo "Worker failed to drain active job and exit" >&2; exit 1
fi
wait "$WORKER_PID"
WORKER_PID=""
state="$(psql -Atq -v ON_ERROR_STOP=1 -c "SELECT status||'|'||(result->>'answer') FROM river_ai_jobs WHERE id='$job_id'")"
if [[ "$state" != "succeeded|"*ACTIVE_SHUTDOWN_DRAIN_TEST* ]]; then echo "Active job did not complete during graceful drain: $state" >&2; exit 1; fi
echo "SIGTERM during active synthetic inference -> drain and persisted completion: PASS"
