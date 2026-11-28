#!/usr/bin/env bash
set -euo pipefail
: "${PGHOST:=localhost}"
: "${PGPORT:=5432}"
: "${PGDATABASE:=rivercore}"
: "${PGUSER:=rivercore}"
: "${PGPASSWORD:=rivercore-test}"
export PGPASSWORD
psql -v ON_ERROR_STOP=1 -f infra/river-ai/worker-queue.sql
# Success + lock-token fencing.
job_id="$(psql -At -c "INSERT INTO river_ai_jobs(payload) VALUES (\$\$ {"case":"success"} \$\$::jsonb) RETURNING id")"
claim="$(psql -At -c "SELECT id || '|' || locked_by || '|' || lock_token FROM river_ai_claim_job('integration-worker',60)")"
IFS='|' read -r claimed_id worker token <<< "$claim"
[[ "$claimed_id" == "$job_id" ]]
psql -v ON_ERROR_STOP=1 -c "SELECT river_ai_finish_job('$job_id','integration-worker','00000000-0000-4000-8000-000000000000','{}'::jsonb)" | grep -q f
psql -v ON_ERROR_STOP=1 -c "SELECT river_ai_finish_job('$job_id','integration-worker','$token',\$\$ {"ok":true} \$\$::jsonb)" | grep -q t
[[ "$(psql -At -c "SELECT status FROM river_ai_jobs WHERE id='$job_id'")" == "succeeded" ]]
# Failure enters retry_wait, then a later claim succeeds.
retry_id="$(psql -At -c "INSERT INTO river_ai_jobs(payload) VALUES (\$\$ {"case":"retry"} \$\$::jsonb) RETURNING id")"
retry_claim="$(psql -At -c "SELECT lock_token FROM river_ai_claim_job('retry-worker',60)")"
psql -v ON_ERROR_STOP=1 -c "SELECT river_ai_fail_job('$retry_id','retry-worker','$retry_claim','synthetic failure')" | grep -q t
[[ "$(psql -At -c "SELECT status FROM river_ai_jobs WHERE id='$retry_id'")" == "retry_wait" ]]
psql -v ON_ERROR_STOP=1 -c "UPDATE river_ai_jobs SET run_after=NOW() WHERE id='$retry_id'"
retry_claim2="$(psql -At -c "SELECT lock_token FROM river_ai_claim_job('retry-worker-2',60)")"
[[ -n "$retry_claim2" ]]
psql -v ON_ERROR_STOP=1 -c "SELECT river_ai_finish_job('$retry_id','retry-worker-2','$retry_claim2',\$\$ {"retried":true} \$\$::jsonb)" | grep -q t
# Expired lease is recovered, and exhausted attempts are dead-lettered.
lease_id="$(psql -At -c "INSERT INTO river_ai_jobs(payload,max_attempts) VALUES (\$\$ {"case":"lease"} \$\$::jsonb,2) RETURNING id")"
lease_token="$(psql -At -c "SELECT lock_token FROM river_ai_claim_job('lease-worker',30)")"
psql -v ON_ERROR_STOP=1 -c "UPDATE river_ai_jobs SET locked_until=NOW()-INTERVAL '1 second' WHERE id='$lease_id'"
psql -v ON_ERROR_STOP=1 -c "SELECT * FROM river_ai_claim_job('lease-recovery',30)" >/dev/null
[[ "$(psql -At -c "SELECT status FROM river_ai_jobs WHERE id='$lease_id'")" == "running" ]]
psql -v ON_ERROR_STOP=1 -c "UPDATE river_ai_jobs SET locked_until=NOW()-INTERVAL '1 second' WHERE id='$lease_id'"
psql -v ON_ERROR_STOP=1 -c "SELECT * FROM river_ai_claim_job('lease-exhaustion-check',30)" >/dev/null
[[ "$(psql -At -c "SELECT status FROM river_ai_jobs WHERE id='$lease_id'")" == "dead_letter" ]]
echo "Queue SQL integration checks passed."
