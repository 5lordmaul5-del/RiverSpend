"""RC-160: safe, bounded RSWorkerEngine prototype (stdlib only)."""
from __future__ import annotations
import json, time, uuid
from dataclasses import dataclass
from typing import Any, Callable
MAX_TASK_BYTES=16384
TASK_TYPES={"echo","json_validate","metrics_report"}
class WorkerError(ValueError): pass
@dataclass
class Task:
 id:str; kind:str; payload:dict; status:str="queued"; result:Any=None; error:str|None=None
class RSWorkerEngine:
 def __init__(self,max_queue=100,max_workers=2,timeout_seconds=2.0):
  if not (1<=max_queue<=10000 and 1<=max_workers<=64 and .05<=timeout_seconds<=30): raise WorkerError("invalid limits")
  self.max_queue=max_queue; self.max_workers=max_workers; self.timeout=timeout_seconds; self.handlers={}; self.tasks={}; self.active=set()
  self.register("echo",self._echo); self.register("json_validate",self._validate); self.register("metrics_report",self._metrics)
 def register(self,kind,handler):
  if kind not in TASK_TYPES or not callable(handler): raise WorkerError("handler type not allowlisted")
  self.handlers[kind]=handler
 def submit(self,kind,payload):
  if kind not in self.handlers or not isinstance(payload,dict): raise WorkerError("unsupported task or payload")
  if len(json.dumps(payload,ensure_ascii=False,separators=(",",":")).encode())>MAX_TASK_BYTES: raise WorkerError("payload too large")
  if sum(t.status=="queued" for t in self.tasks.values())>=self.max_queue: raise WorkerError("queue full")
  tid=str(uuid.uuid4()); self.tasks[tid]=Task(tid,kind,payload); return tid
 def run_one(self,worker_id,capabilities):
  if not worker_id or len(worker_id)>128 or not isinstance(capabilities,set): raise WorkerError("invalid worker")
  if len(self.active)>=self.max_workers:return None
  task=next((t for t in self.tasks.values() if t.status=="queued" and t.kind in capabilities),None)
  if task is None:return None
  task.status="running";self.active.add(task.id);started=time.monotonic()
  try:
   result=self.handlers[task.kind](task.payload)
   if time.monotonic()-started>self.timeout: task.status="failed";task.error="timeout";return self._view(task)
   task.result=result;task.status="completed"
  except Exception:task.status="failed";task.error="handler_failed"
  finally:self.active.discard(task.id)
  return self._view(task)
 def cancel(self,tid):
  t=self.tasks.get(tid)
  if t is None or t.status!="queued":return False
  t.status="cancelled";return True
 def status(self):
  return {s:sum(t.status==s for t in self.tasks.values()) for s in ("queued","running","completed","failed","cancelled")}|{"capacity":self.max_workers,"queue_limit":self.max_queue}
 @staticmethod
 def _view(t):return {"id":t.id,"type":t.kind,"status":t.status,"result":t.result,"error":t.error}
 @staticmethod
 def _echo(p):return {"echo":p}
 @staticmethod
 def _validate(p):
  v=p.get("json")
  if not isinstance(v,str):raise WorkerError("json must be string")
  json.loads(v);return {"valid":True}
 @staticmethod
 def _metrics(p):
  ks=("total","success","failed")
  if any(type(p.get(k)) is not int or p[k]<0 for k in ks):raise WorkerError("invalid metrics")
  if p["success"]+p["failed"]>p["total"]:raise WorkerError("inconsistent metrics")
  return {k:p[k] for k in ks}
