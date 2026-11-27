"""RC-200 unified, decision-only orchestration facade over safety validator."""
from rc199_execution_safety_validator import validate
class UnifiedExecutionControl:
 def evaluate(self,job_state,execution_state,lease_valid,fencing_token_current,idempotency_state):
  safety=validate(job_state,execution_state,lease_valid,fencing_token_current,idempotency_state)
  return {"component":"RC-200","decision":safety["decision"],"safe":safety["safe"],"issues":safety["issues"],"execution_requested":False}
