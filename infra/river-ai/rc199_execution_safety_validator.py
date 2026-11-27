"""RC-199 conservative execution-safety validator (decision-only prototype)."""
def validate(job_state, execution_state, lease_valid, fencing_token_current, idempotency_state):
 issues=[]
 if job_state not in ("queued","leased","running","completed","failed","cancelled"):issues.append("unknown_job_state")
 if execution_state not in ("idle","active","succeeded","failed","unknown"):issues.append("unknown_execution_state")
 if job_state=="completed" and execution_state!="succeeded":issues.append("completion_mismatch")
 if job_state=="running" and execution_state!="active":issues.append("running_mismatch")
 if job_state=="leased" and not lease_valid:issues.append("lease_invalid")
 if job_state=="running" and not fencing_token_current:issues.append("fencing_not_current")
 if idempotency_state=="failed" and job_state=="completed":issues.append("idempotency_failure_mismatch")
 if idempotency_state=="processing" and job_state=="completed":issues.append("idempotency_incomplete")
 safe=not issues
 return {"safe":safe,"decision":"allow_observation" if safe else "block_and_reconcile","issues":issues}
