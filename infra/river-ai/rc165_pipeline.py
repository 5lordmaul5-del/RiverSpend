"""RC-165 deterministic integration pipeline prototype with fail-closed stages."""
class PipelineError(Exception):pass
class RC165Pipeline:
 def __init__(self,ledger,policy,executor,worker_id,capabilities):
  self.ledger=ledger;self.policy=policy;self.executor=executor;self.worker_id=worker_id;self.capabilities=set(capabilities)
 def run_once(self):
  lease=self.ledger.lease_next(self.worker_id,self.capabilities)
  if lease is None:return {"status":"idle"}
  tid=lease.get("task_id");kind=lease.get("kind");owner=lease.get("owner");payload=lease.get("payload")
  if not isinstance(tid,str) or not tid or not isinstance(kind,str) or kind not in self.capabilities or not isinstance(owner,str) or not isinstance(payload,dict):
   return {"status":"rejected","reason":"invalid_lease"}
  auth=None
  try:
   auth=self.policy.authorize(kind,owner,cost=1)
   result=self.executor.execute(kind,payload)
   if not isinstance(result,dict):raise PipelineError("invalid_result")
   self.policy.finish(auth,True)
   self.ledger.complete(tid,self.worker_id,result)
   return {"status":"completed","task_id":tid}
  except Exception:
   if auth is not None:
    try:self.policy.refund(auth)
    except Exception:pass
   try:self.ledger.fail(tid,self.worker_id,"pipeline_failed")
   except Exception:pass
   return {"status":"failed","task_id":tid,"error":"pipeline_failed"}
