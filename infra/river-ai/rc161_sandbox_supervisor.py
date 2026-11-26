"""RC-161 process-supervised toy-task runner. Not a hardened sandbox."""
from __future__ import annotations
import json,os,subprocess,sys,tempfile
from pathlib import Path
ALLOWED={"echo","json_validate","metrics_report"}
MAX_BYTES=16384
class SupervisorError(RuntimeError):pass
class SandboxSupervisor:
 def __init__(self,timeout=1.5):
  if not (.1<=timeout<=10):raise ValueError("timeout bounds")
  self.timeout=timeout
 def run(self,kind,payload):
  if kind not in ALLOWED or not isinstance(payload,dict):raise SupervisorError("task denied")
  request=json.dumps({"type":kind,"payload":payload},ensure_ascii=False,separators=(",",":"))
  if len(request.encode())>MAX_BYTES:raise SupervisorError("input too large")
  child=Path(__file__).with_name("rc161_restricted_child.py")
  env={"PATH":os.environ.get("PATH",""),"PYTHONIOENCODING":"utf-8"}
  with tempfile.TemporaryDirectory(prefix="rsworker-") as cwd:
   try:
    cp=subprocess.run([sys.executable,"-I",str(child)],input=request,text=True,capture_output=True,
      cwd=cwd,env=env,timeout=self.timeout,check=False)
   except subprocess.TimeoutExpired as e:raise SupervisorError("timeout") from e
   if cp.returncode!=0:raise SupervisorError("child failed")
   try:out=json.loads(cp.stdout)
   except Exception as e:raise SupervisorError("invalid child response") from e
   if not out.get("ok"):raise SupervisorError("task failed")
   return out["result"]
