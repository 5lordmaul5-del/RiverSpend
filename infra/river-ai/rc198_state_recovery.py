"""RC-198: conservative inspection/recovery helpers for stale idempotency records."""
class StateRecovery:
 def __init__(self,registry,clock=None):
  import time
  self.registry=registry;self.clock=clock or time.time
 def inspect(self,key):
  row=self.registry.get(key)
  if not row:return {"status":"absent"}
  # RC-196 row shape: key, hash, state, created, updated, result, error
  return {"status":row[2],"key":row[0],"payload_hash":row[1],"updated":row[4],"result":row[5],"error":row[6]}
 def classify_processing(self,key,stale_after):
  item=self.inspect(key)
  if item["status"]!="processing":return {"action":"none","state":item["status"]}
  age=self.clock()-item["updated"]
  if age<stale_after:return {"action":"wait","age":age}
  # deliberately never redispatch; requires external evidence/manual reconciliation
  return {"action":"manual_reconciliation","age":age,"reason":"stale processing state does not prove original execution stopped"}
