"""RC-169 division manager: deterministic task routing registry prototype."""
from __future__ import annotations
import uuid,time
from rc169_divisions_catalog import DIVISIONS
class DivisionManager:
 def __init__(self):self.tasks={}
 def assign(self,division,description,priority="normal",requester="system"):
  if division not in DIVISIONS:return {"ok":False,"error":"unknown_division"}
  if not isinstance(description,str) or not description.strip() or len(description)>4000:return {"ok":False,"error":"invalid_description"}
  if priority not in {"low","normal","high","urgent"}:return {"ok":False,"error":"invalid_priority"}
  task={"id":str(uuid.uuid4()),"division":division,"division_name":DIVISIONS[division]["name"],"description":description.strip(),"priority":priority,"requester":requester,"status":"queued","created_at":time.time()}
  self.tasks[task["id"]]=task
  return {"ok":True,"task":task.copy()}
 def list_tasks(self,division=None):
  tasks=list(self.tasks.values())
  if division is not None:tasks=[t for t in tasks if t["division"]==division]
  order={"urgent":0,"high":1,"normal":2,"low":3}
  return sorted((t.copy() for t in tasks),key=lambda t:(order[t["priority"]],t["created_at"]))
 def update_status(self,task_id,status):
  allowed={"queued","in_progress","blocked","completed","cancelled"}
  task=self.tasks.get(task_id)
  if not task:return {"ok":False,"error":"task_not_found"}
  if status not in allowed:return {"ok":False,"error":"invalid_status"}
  task["status"]=status;task["updated_at"]=time.time()
  return {"ok":True,"task":task.copy()}
