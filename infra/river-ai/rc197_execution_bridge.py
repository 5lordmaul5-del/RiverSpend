"""RC-197 orchestration bridge prototype. Coordinates idempotency and injected execution."""
class ExecutionBridge:
 def __init__(self,registry,executor):
  self.registry=registry;self.executor=executor
 def run(self,key,payload):
  decision=self.registry.begin(key,payload)
  if decision["status"]!="accepted":
   return decision
  try:
   result=self.executor(payload)
  except Exception as exc:
   self.registry.fail(key,repr(exc))
   return {"status":"failed","error":repr(exc)}
  if not self.registry.complete(key,result):
   return {"status":"reconciliation_required","result":result}
  return {"status":"completed","result":result}
