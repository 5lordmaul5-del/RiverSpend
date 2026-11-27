"""RC-201 integration readiness: explicit module dependency map and status metadata."""
MODULES=[
 {"id":"RC182","name":"Bounded Worker Runner","depends":[],"status":"prototype"},
 {"id":"RC183","name":"Entitlements","depends":[],"status":"prototype"},
 {"id":"RC184","name":"Usage Ledger","depends":["RC183"],"status":"prototype"},
 {"id":"RC185","name":"Atomic Quota Reservation","depends":["RC184"],"status":"prototype"},
 {"id":"RC186","name":"Metered Executor","depends":["RC183","RC185"],"status":"prototype"},
 {"id":"RC187","name":"Metered Worker","depends":["RC182","RC186"],"status":"prototype"},
 {"id":"RC188","name":"Recovery Reconciliation","depends":["RC184","RC185"],"status":"prototype"},
 {"id":"RC189","name":"Policy Audit","depends":[],"status":"prototype"},
 {"id":"RC190","name":"Request Guard","depends":["RC189"],"status":"prototype"},
 {"id":"RC191","name":"Leased Slots","depends":["RC190"],"status":"prototype"},
 {"id":"RC192","name":"Fencing Registry","depends":["RC191"],"status":"prototype"},
 {"id":"RC193","name":"Execution Supervisor","depends":["RC192"],"status":"prototype"},
 {"id":"RC194","name":"Recovery Coordinator","depends":["RC193"],"status":"prototype"},
 {"id":"RC195","name":"Crash Reaper","depends":["RC194"],"status":"prototype"},
 {"id":"RC196","name":"Idempotency Registry","depends":[],"status":"prototype"},
 {"id":"RC197","name":"Execution Bridge","depends":["RC196"],"status":"prototype"},
 {"id":"RC198","name":"State Recovery","depends":["RC196"],"status":"prototype"},
 {"id":"RC199","name":"Safety Validator","depends":["RC192","RC193","RC196"],"status":"prototype"},
 {"id":"RC200","name":"Unified Control Facade","depends":["RC199"],"status":"prototype"},
]
def validate_map(modules=MODULES):
 ids={m["id"] for m in modules};issues=[]
 for m in modules:
  for d in m["depends"]:
   if d not in ids:issues.append({"module":m["id"],"missing_dependency":d})
 # detect cycle using DFS
 graph={m["id"]:m["depends"] for m in modules};visiting=set();done=set()
 def dfs(n,path):
  if n in visiting:issues.append({"cycle":path+[n]});return
  if n in done:return
  visiting.add(n)
  for d in graph.get(n,[]):dfs(d,path+[n])
  visiting.remove(n);done.add(n)
 for n in graph:dfs(n,[])
 return {"module_count":len(modules),"issues":issues,"valid":not issues}
