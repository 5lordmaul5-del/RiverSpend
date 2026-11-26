"""RC-162 policy gates: task allowlisting, budget/quota accounting and audit records."""
from __future__ import annotations
import time,uuid
from dataclasses import dataclass
ALLOWED={"echo","json_validate","metrics_report"}
class PolicyDenied(ValueError):pass
@dataclass
class Request:
 id:str; kind:str; owner:str; cost:int; approved:bool=False
class WorkerPolicy:
 def __init__(self,per_owner_limit=20,global_limit=100):
  if not (1<=per_owner_limit<=10000 and per_owner_limit<=global_limit<=100000):raise ValueError("invalid policy limits")
  self.per_owner_limit=per_owner_limit;self.global_limit=global_limit;self.spent={};self.total=0;self.pending={};self.audit=[]
 def _event(self,event,owner,request_id,detail):
  self.audit.append({"ts":time.time(),"event":event,"owner":owner,"request_id":request_id,"detail":detail})
 def authorize(self,kind,owner,cost=1,requires_approval=False,approved=False):
  if not owner or len(owner)>128 or kind not in ALLOWED:raise PolicyDenied("request denied")
  if type(cost) is not int or cost<1 or cost>self.per_owner_limit:raise PolicyDenied("cost invalid")
  if self.spent.get(owner,0)+cost>self.per_owner_limit or self.total+cost>self.global_limit:raise PolicyDenied("budget exhausted")
  if requires_approval and not approved:raise PolicyDenied("approval required")
  rid=str(uuid.uuid4());r=Request(rid,kind,owner,cost,approved)
  self.spent[owner]=self.spent.get(owner,0)+cost;self.total+=cost;self.pending[rid]=r
  self._event("authorized",owner,rid,{"kind":kind,"cost":cost,"approval":approved})
  return rid
 def finish(self,rid,success):
  r=self.pending.pop(rid,None)
  if r is None:raise PolicyDenied("unknown request")
  self._event("finished" if success else "failed",r.owner,rid,{})
  return True
 def refund(self,rid):
  r=self.pending.pop(rid,None)
  if r is None:return False
  self.spent[r.owner]=max(0,self.spent.get(r.owner,0)-r.cost);self.total=max(0,self.total-r.cost)
  self._event("refunded",r.owner,rid,{"cost":r.cost});return True
 def snapshot(self):
  return {"spent_total":self.total,"owners":dict(self.spent),"pending":len(self.pending),"audit_events":len(self.audit)}
