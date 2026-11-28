#!/usr/bin/env bash
set -euo pipefail
: "${PGHOST:=localhost}" "${PGPORT:=5432}" "${PGDATABASE:=rivercore}" "${PGUSER:=rivercore}" "${PGPASSWORD:=rivercore-test}"
export PGPASSWORD
TOKEN="river-ai-e2e-test-token-012345678901234567890"
MODEL="test-model"
API_PID="" WORKER_PID="" MOCK_PID=""
cleanup(){ for pid in "$WORKER_PID" "$API_PID" "$MOCK_PID"; do if [[ -n "$pid" ]]; then kill "$pid" 2>/dev/null || true; fi; done; }
trap cleanup EXIT
psql -q -v ON_ERROR_STOP=1 -f infra/river-ai/schema.sql
psql -q -v ON_ERROR_STOP=1 -f infra/river-ai/worker-queue.sql
RIVER_AI_LOCAL_MODEL="$MODEL" node infra/river-ai/tests/mock-model.mjs &
MOCK_PID=$!
DATABASE_URL="postgres://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE" RIVER_AI_ADMIN_TOKEN="$TOKEN" RIVER_AI_LOCAL_URL="http://127.0.0.1:11434/v1/chat/completions" RIVER_AI_LOCAL_MODEL="$MODEL" PORT=8787 node server/river-ai-standalone.mjs &
API_PID=$!
DATABASE_URL="postgres://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE" RIVER_AI_LOCAL_URL="http://127.0.0.1:11434/v1/chat/completions" RIVER_AI_LOCAL_MODEL="$MODEL" RIVER_AI_WORKER_POLL_MS=500 node server/river-ai-worker.mjs &
WORKER_PID=$!
for i in {1..40}; do if curl -fsS http://127.0.0.1:8787/health >/dev/null && curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; then break; fi; sleep 1; done
curl -fsS http://127.0.0.1:8787/ready >/dev/null

# Verify optional idempotency key replays the same durable job and rejects key reuse with different payload.
idem1="$(curl -fsS -X POST http://127.0.0.1:8787/v1/jobs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -H "Idempotency-Key: e2e-idempotency-key-001" -d '{"agentKey":"nova","task":"TEST_IDEMPOTENCY_REPLAY"}')"
idem2="$(curl -fsS -X POST http://127.0.0.1:8787/v1/jobs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -H "Idempotency-Key: e2e-idempotency-key-001" -d '{"agentKey":"nova","task":"TEST_IDEMPOTENCY_REPLAY"}')"
node -e 'const a=JSON.parse(process.argv[1]),b=JSON.parse(process.argv[2]);if(a.job.id!==b.job.id||b.replayed!==true){console.error("Idempotent replay mismatch",a,b);process.exit(1)}console.log("Same idempotency key -> existing job replay: PASS")' "$idem1" "$idem2"
conflict_code="$(curl -sS -o /tmp/river-idem-conflict.json -w '%{http_code}' -X POST http://127.0.0.1:8787/v1/jobs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -H "Idempotency-Key: e2e-idempotency-key-001" -d '{"agentKey":"nova","task":"DIFFERENT_TASK"}')"
if [[ "$conflict_code" != "409" ]]; then echo "Expected idempotency key conflict HTTP 409, got $conflict_code" >&2; exit 1; fi
echo "Same key with different request -> HTTP 409: PASS"
response="$(curl -fsS -X POST http://127.0.0.1:8787/v1/jobs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"agentKey":"nova","task":"TEST_E2E_RIVERSSAI"}')"
job_id="$(node -e 'const x=JSON.parse(process.argv[1]); console.log(x.job.id)' "$response")"
for i in {1..60}; do status="$(curl -fsS http://127.0.0.1:8787/v1/jobs/$job_id -H "Authorization: Bearer $TOKEN" | node -e 'let x="";process.stdin.on("data",d=>x+=d).on("end",()=>console.log(JSON.parse(x).job.status))')"; if [[ "$status" == "succeeded" ]]; then break; fi; sleep 1; done
final="$(curl -fsS http://127.0.0.1:8787/v1/jobs/$job_id -H "Authorization: Bearer $TOKEN")"
node -e 'const j=JSON.parse(process.argv[1]).job; if(j.status!=="succeeded" || !j.result?.answer?.includes("TEST_E2E_RIVERSSAI")) { console.error(j); process.exit(1); } console.log("API -> queue -> worker -> mock model -> persisted result: PASS")' "$final"

# Restart API process while PostgreSQL remains available; verify job result survives.
kill "$API_PID"
wait "$API_PID" 2>/dev/null || true
DATABASE_URL="postgres://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE" RIVER_AI_ADMIN_TOKEN="$TOKEN" RIVER_AI_LOCAL_URL="http://127.0.0.1:11434/v1/chat/completions" RIVER_AI_LOCAL_MODEL="$MODEL" PORT=8787 node server/river-ai-standalone.mjs &
API_PID=$!
for i in {1..40}; do if curl -fsS http://127.0.0.1:8787/health >/dev/null; then break; fi; sleep 1; done
persisted="$(curl -fsS http://127.0.0.1:8787/v1/jobs/$job_id -H "Authorization: Bearer $TOKEN")"
node -e 'const j=JSON.parse(process.argv[1]).job; if(j.status!=="succeeded" || !j.result?.answer?.includes("TEST_E2E_RIVERSSAI")) process.exit(1); console.log("API process restart -> persisted job/result retrieval: PASS")' "$persisted"


# Verify SIGTERM exits the idle worker promptly and cleanly.
kill -TERM "$WORKER_PID"
for i in {1..15}; do
  if ! kill -0 "$WORKER_PID" 2>/dev/null || ps -o stat= -p "$WORKER_PID" 2>/dev/null | awk '$1 ~ /^Z/ {found=1} END {exit !found}'; then break; fi
  sleep 1
done
if kill -0 "$WORKER_PID" 2>/dev/null && ! ps -o stat= -p "$WORKER_PID" 2>/dev/null | awk '$1 ~ /^Z/ {found=1} END {exit !found}'; then
  echo "Worker failed to exit after SIGTERM within 15 seconds" >&2
  exit 1
fi
wait "$WORKER_PID"
WORKER_PID=""
echo "Idle worker SIGTERM -> clean process exit: PASS"
