#!/usr/bin/env bash
set -euo pipefail
: "${PGHOST:=localhost}" "${PGPORT:=5432}" "${PGDATABASE:=rivercore}" "${PGUSER:=rivercore}" "${PGPASSWORD:=rivercore-test}"
export PGPASSWORD
TOKEN="river-ai-crash-recovery-test-token-0123456789"
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
for i in {1..40}; do if curl -fsS http://127.0.0.1:8787/health >/dev/null && curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; then break; fi; sleep 1; done
curl -fsS http://127.0.0.1:8787/ready >/dev/null
response="$(curl -fsS -X POST http://127.0.0.1:8787/v1/jobs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"agentKey":"nova","task":"WORKER_CRASH_RECOVERY_SYNTHETIC"}')"
job_id="$(node -e 'const x=JSON.parse(process.argv[1]); console.log(x.job.id)' "$response")"
DATABASE_URL="postgres://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE" RIVER_AI_LOCAL_URL="http://127.0.0.1:11434/v1/chat/completions" RIVER_AI_LOCAL_MODEL="$MODEL" RIVER_AI_WORKER_POLL_MS=500 node server/river-ai-worker.mjs &
WORKER_PID=$!
claimed=0
for i in {1..20}; do
  status="$(psql -Atq -v ON_ERROR_STOP=1 -c "SELECT status FROM river_ai_jobs WHERE id='$job_id'")"
  if [[ "$status" == "running" ]]; then claimed=1; break; fi
  sleep .25
done
if [[ "$claimed" != "1" ]]; then echo "Initial worker failed to claim job" >&2; exit 1; fi
# Simulate abrupt process death while model inference is still in flight.
kill -KILL "$WORKER_PID" 2>/dev/null || true
wait "$WORKER_PID" 2>/dev/null || true
WORKER_PID=""
# Simulate lease expiry without waiting for the production lease duration.
psql -q -v ON_ERROR_STOP=1 -c "UPDATE river_ai_jobs SET locked_until=NOW()-INTERVAL '1 second' WHERE id='$job_id' AND status='running';"
# Force recovery eligibility for the deterministic synthetic CI scenario.
psql -q -v ON_ERROR_STOP=1 -c "SELECT river_ai_claim_job('crash-recovery-sweep',60); UPDATE river_ai_jobs SET run_after=NOW() WHERE id='$job_id' AND status='retry_wait';"
DATABASE_URL="postgres://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE" RIVER_AI_LOCAL_URL="http://127.0.0.1:11434/v1/chat/completions" RIVER_AI_LOCAL_MODEL="$MODEL" RIVER_AI_WORKER_POLL_MS=500 node server/river-ai-worker.mjs &
WORKER_PID=$!
for i in {1..40}; do
  state="$(psql -Atq -v ON_ERROR_STOP=1 -c "SELECT status||'|'||(result->>'answer') FROM river_ai_jobs WHERE id='$job_id")"
  if [[ "$state" == "succeeded|"*WORKER_CRASH_RECOVERY_SYNTHETIC* ]]; then break; fi
  sleep .5
done
state="$(psql -Atq -v ON_ERROR_STOP=1 -c "SELECT status||'|'||attempts||'|'||(result->>'answer') FROM river_ai_jobs WHERE id='$job_id")"
if [[ "$state" != "succeeded|2|"*WORKER_CRASH_RECOVERY_SYNTHETIC* ]]; then echo "Crash recovery result mismatch: $state" >&2; exit 1; fi
echo "Abrupt worker death -> expired lease recovery -> second worker completion: PASS"
