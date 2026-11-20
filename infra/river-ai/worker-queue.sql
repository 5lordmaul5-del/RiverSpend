-- RiverSSAI durable worker queue for the isolated RiverCloud PostgreSQL runtime.
-- This schema is intentionally separate from the live RiverSpend Supabase project.
CREATE TABLE IF NOT EXISTS river_ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL DEFAULT 'agent_task' CHECK (task_type IN ('agent_task')),
  agent_key TEXT NOT NULL DEFAULT 'nova',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','succeeded','retry_wait','dead_letter')),
  priority SMALLINT NOT NULL DEFAULT 100 CHECK (priority BETWEEN 0 AND 1000),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 4 CHECK (max_attempts BETWEEN 1 AND 12),
  run_after TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_by TEXT,
  lock_token UUID,
  locked_until TIMESTAMPTZ,
  result JSONB,
  last_error TEXT,
  created_by TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS river_ai_jobs_claim_idx
  ON river_ai_jobs (priority ASC, run_after ASC, created_at ASC)
  WHERE status IN ('queued','retry_wait');
CREATE INDEX IF NOT EXISTS river_ai_jobs_lease_idx
  ON river_ai_jobs (locked_until)
  WHERE status='running';
CREATE TABLE IF NOT EXISTS river_ai_worker_events (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID REFERENCES river_ai_jobs(id) ON DELETE SET NULL,
  worker_id TEXT NOT NULL,
  event TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS river_ai_worker_events_job_idx
  ON river_ai_worker_events (job_id, created_at DESC);

-- Claim one job atomically. Expired leases become eligible again.
CREATE OR REPLACE FUNCTION river_ai_claim_job(p_worker_id TEXT, p_lease_seconds INTEGER DEFAULT 180)
RETURNS SETOF river_ai_jobs
LANGUAGE plpgsql
AS $$
DECLARE
  claimed river_ai_jobs;
BEGIN
  UPDATE river_ai_jobs
     SET status = CASE WHEN attempts >= max_attempts THEN 'dead_letter' ELSE 'retry_wait' END,
         locked_by = NULL, lock_token = NULL, locked_until = NULL,
         last_error = COALESCE(last_error, 'Worker lease expired'),
         updated_at = NOW(),
         finished_at = CASE WHEN attempts >= max_attempts THEN NOW() ELSE NULL END
   WHERE status = 'running' AND locked_until < NOW();

  WITH candidate AS (
    SELECT id
      FROM river_ai_jobs
     WHERE status IN ('queued','retry_wait')
       AND run_after <= NOW()
       AND attempts < max_attempts
     ORDER BY priority ASC, run_after ASC, created_at ASC
     FOR UPDATE SKIP LOCKED
     LIMIT 1
  )
  UPDATE river_ai_jobs j
     SET status='running',
         attempts=j.attempts+1,
         locked_by=p_worker_id,
         lock_token=gen_random_uuid(),
         locked_until=NOW() + make_interval(secs => GREATEST(30, LEAST(p_lease_seconds, 900))),
         started_at=COALESCE(j.started_at,NOW()),
         updated_at=NOW()
    FROM candidate c
   WHERE j.id=c.id
  RETURNING j.* INTO claimed;

  IF FOUND THEN
    INSERT INTO river_ai_worker_events(job_id,worker_id,event,details)
    VALUES (claimed.id,p_worker_id,'job.claimed',jsonb_build_object('attempt',claimed.attempts));
    RETURN NEXT claimed;
  END IF;
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION river_ai_finish_job(
  p_job_id UUID, p_worker_id TEXT, p_lock_token UUID, p_result JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE changed INTEGER;
BEGIN
  UPDATE river_ai_jobs
     SET status='succeeded', result=COALESCE(p_result,'{}'::jsonb),
         locked_by=NULL, lock_token=NULL, locked_until=NULL,
         last_error=NULL, updated_at=NOW(), finished_at=NOW()
   WHERE id=p_job_id AND status='running'
     AND locked_by=p_worker_id AND lock_token=p_lock_token;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed=1 THEN
    INSERT INTO river_ai_worker_events(job_id,worker_id,event)
    VALUES (p_job_id,p_worker_id,'job.succeeded');
  END IF;
  RETURN changed=1;
END;
$$;

CREATE OR REPLACE FUNCTION river_ai_fail_job(
  p_job_id UUID, p_worker_id TEXT, p_lock_token UUID, p_error TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE current_job river_ai_jobs;
DECLARE next_status TEXT;
DECLARE delay_seconds INTEGER;
BEGIN
  SELECT * INTO current_job FROM river_ai_jobs
   WHERE id=p_job_id AND status='running'
     AND locked_by=p_worker_id AND lock_token=p_lock_token
   FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  next_status := CASE WHEN current_job.attempts >= current_job.max_attempts
                      THEN 'dead_letter' ELSE 'retry_wait' END;
  delay_seconds := LEAST(900, 15 * (2 ^ LEAST(current_job.attempts, 6))::INTEGER);
  UPDATE river_ai_jobs
     SET status=next_status,
         run_after=CASE WHEN next_status='retry_wait' THEN NOW()+make_interval(secs=>delay_seconds) ELSE run_after END,
         locked_by=NULL, lock_token=NULL, locked_until=NULL,
         last_error=LEFT(COALESCE(p_error,'Unknown worker error'),2000),
         updated_at=NOW(),
         finished_at=CASE WHEN next_status='dead_letter' THEN NOW() ELSE NULL END
   WHERE id=p_job_id;
  INSERT INTO river_ai_worker_events(job_id,worker_id,event,details)
  VALUES (p_job_id,p_worker_id,'job.failed',jsonb_build_object('status',next_status,'attempt',current_job.attempts));
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION river_ai_claim_job(TEXT,INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION river_ai_finish_job(UUID,TEXT,UUID,JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION river_ai_fail_job(UUID,TEXT,UUID,TEXT) FROM PUBLIC;
