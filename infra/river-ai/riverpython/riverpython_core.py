"""RiverPython: RiverSpend's small, safe Python-based service foundation."""
from __future__ import annotations
import json, time, uuid
from dataclasses import dataclass, asdict
from typing import Any
@dataclass
class RiverPythonEnvelope:
 request_id:str
 action:str
 payload:dict[str,Any]
 created_at:float
 def to_json(self)->str:return json.dumps(asdict(self),sort_keys=True)
class RiverPythonCore:
 VERSION="0.1.0-prototype"
 ACTIONS={"health","echo","validate_json"}
 def handle(self,action:str,payload:Any)->dict:
  if action not in self.ACTIONS:return {"ok":False,"error":"action_not_allowed"}
  if not isinstance(payload,dict):return {"ok":False,"error":"payload_must_be_object"}
  if action=="health":return {"ok":True,"runtime":"RiverPython","version":self.VERSION}
  if action=="echo":return {"ok":True,"payload":payload}
  if action=="validate_json":
   try:json.dumps(payload)
   except (TypeError,ValueError):return {"ok":False,"error":"invalid_json_payload"}
   return {"ok":True,"valid":True}
 def envelope(self,action,payload):
  return RiverPythonEnvelope(str(uuid.uuid4()),action,payload,time.time())
