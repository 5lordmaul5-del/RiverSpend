"""RC-163 orchestration adapter prototype for ledger leases and supervised workers."""
from __future__ import annotations
from typing import Protocol
class Ledger(Protocol):
 def lease_next(self,worker_id:str,capabilities:set[str])->dict|None: ...
 def complete(self,task_id:str,worker_id:str,result:dict)->None: ...
 def fail(self,task_id:str,worker_id:str,error:str)->None: ...
class RC163Adapter:
 def __init__(self,ledger,supervisor,policy,worker_id,capabilities):
  if not worker_id or len(worker_id)>128 or not isinstance(capabilities,set):raise ValueError("invalid worker")
  self.ledger=ledger;self.supervisor=supervisor;self.policy=policy;self.worker_id=worker_id;self.capabilities=set(capabilities)
 def step(self):
  lease=self.ledger.lease_next(self.worker_id,self.capabilities)
  if lease is None:return {"status":"idle"}
  # Validate the minimum contract before invoking any handler.
  task_id=lease.get("task_id");kind=lease.get("kind");owner=lease.get("owner");payload=lease.get("payload")
  if not isinstance(task_id,str) or not task_id or kind not in self.capabilities or not isinstance(owner,str) or not isinstance(payload,dict):
   return {"status":"rejected","reason":"invalid_lease"}
  try:
   policy_id=self.policy.authorize(kind,owner,cost=1)
   result=self.supervisor.run(kind,payload)
   self.policy.finish(policy_id,True)
   self.ledger.complete(task_id,self.worker_id,result)
   return {"status":"completed","task_id":task_id}
  except Exception:
   # Refund when authorization exists but processing failed; do not expose exception details.
   try:
    if 'policy_id' in locals(): self.policy.refund(policy_id)
   except Exception: pass
   try:self.ledger.fail(task_id,self.worker_id,"worker_failed")
   except Exception:pass
   return {"status":"failed","task_id":task_id,"error":"worker_failed"}
