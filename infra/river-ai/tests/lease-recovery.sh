#!/usr/bin/env bash
set -euo pipefail
: "${PGHOST:=localhost}" "${PGPORT:=5432}" "${PGDATABASE:=rivercore}" "${PGUSER:=rivercore}" "${PGPASSWORD:=rivercore-test}"
export PGPASSWORD
psql -q -v ON_ERROR_STOP=1 -f infra/river-ai/schema.sql
psql -q -v ON_ERROR_STOP=1 -f infra/river-ai/worker-queue.sql
# Create and claim a synthetic job, simulate worker death by expiring its lease,
# and verify the next claimant can recover it with a fresh fencing token.
# Quiet mode suppresses INSERT's command tag so job_id remains a UUID only.
job_id="$(psql -qAt -v ON_ERROR_STOP=1 -c "INSERT INTO river_ai_jobs(agent_key,payload,run_after,max_attempts) VALUES ('nova',jsonb_build_object('task','LEASE_RECOVERY_TEST'),NOW(),4) RETURNING id")"
if [[ ! "$job_id" =~ ^[0-9a-fA-F-]{36}$ ]]; then echo "Lease recovery test setup failed: invalid job ID"; exit 1; fi
first="$(psql -Atq -v ON_ERROR_STOP=1 -c "SELECT id||'|'||lock_token FROM river_ai_claim_job('worker-crashed',60)")"
psql -q -v ON_ERROR_STOP=1 -c "UPDATE river_ai_jobs SET locked_until=NOW()-INTERVAL '1 second' WHERE id='$job_id';"
# Recovery pass expires the stale lease. Make its retry immediately eligible for deterministic CI.
psql -q -v ON_ERROR_STOP=1 -c "SELECT river_ai_claim_job('recovery-sweep',60); UPDATE river_ai_jobs SET run_after=NOW() WHERE id='$job_id' AND status='retry_wait';"
second="$(psql -Atq -v ON_ERROR_STOP=1 -c "SELECT id||'|'||lock_token FROM river_ai_claim_job('worker-recovered',60)")"
if [[ "$second" != "$job_id|"* ]]; then echo "Lease recovery failed: expected job to be reclaimed"; exit 1; fi
new_token="${second#*|}"
old_token="${first#*|}"
if [[ "$new_token" == "$old_token" || -z "$new_token" ]]; then echo "Lease recovery failed: fencing token was not rotated"; exit 1; fi
stale="$(psql -Atq -v ON_ERROR_STOP=1 -c "SELECT river_ai_finish_job('$job_id','worker-crashed','$old_token','{}'::jsonb)")"
if [[ "$stale" != "f" ]]; then echo "Stale worker fencing failed"; exit 1; fi
echo "Expired lease recovery + token rotation + stale worker fencing: PASS"
