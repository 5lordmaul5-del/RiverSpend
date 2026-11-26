"""RC-161 restricted child process: dispatch only built-in toy handlers."""
import json,sys
def execute(kind,payload):
 if kind=="echo": return {"echo":payload}
 if kind=="json_validate":
  v=payload.get("json")
  if not isinstance(v,str): raise ValueError("invalid json input")
  json.loads(v);return {"valid":True}
 if kind=="metrics_report":
  keys=("total","success","failed")
  if any(type(payload.get(k)) is not int or payload[k]<0 for k in keys):raise ValueError("bad metrics")
  if payload["success"]+payload["failed"]>payload["total"]:raise ValueError("inconsistent metrics")
  return {k:payload[k] for k in keys}
 raise ValueError("task type denied")
if __name__=="__main__":
 try:
  request=json.loads(sys.stdin.read())
  result=execute(request["type"],request["payload"])
  print(json.dumps({"ok":True,"result":result},separators=(",",":")))
 except Exception:
  print(json.dumps({"ok":False,"error":"task_failed"}));sys.exit(2)
