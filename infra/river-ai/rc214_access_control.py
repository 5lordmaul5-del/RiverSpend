"""RC214 policy prototype: roles, permissions, revocation, rotation metadata, audit.
Does NOT store encryption keys. Integrate with an OS/cloud vault for production.
"""
from __future__ import annotations
import json, time
from pathlib import Path

ROLE_PERMISSIONS={
 "owner":{"policy:read","policy:write","key:rotate","key:revoke","audit:read","memory:read","memory:write"},
 "admin":{"policy:read","key:rotate","key:revoke","audit:read","memory:read","memory:write"},
 "agent":{"memory:read","memory:write"},
 "reader":{"memory:read"},
}
class AccessController:
 def __init__(self, audit_path=None):
  self.users={}; self.keys={}; self.audit=[]; self.audit_path=Path(audit_path) if audit_path else None
 def _record(self,action,actor,subject,details=None):
  entry={"ts":time.time(),"action":action,"actor":actor,"subject":subject,"details":details or {}}
  self.audit.append(entry)
  if self.audit_path:
   self.audit_path.parent.mkdir(parents=True,exist_ok=True)
   with self.audit_path.open("a",encoding="utf-8") as f: f.write(json.dumps(entry,sort_keys=True)+"\n")
 def assign_role(self,actor,user,role):
  self.require(actor,"policy:write")
  if role not in ROLE_PERMISSIONS: raise ValueError("Unknown role")
  self.users[user]=role; self._record("role_assigned",actor,user,{"role":role})
 def require(self,user,permission):
  role=self.users.get(user)
  if not role or permission not in ROLE_PERMISSIONS[role]: raise PermissionError("Access denied")
  return True
 def register_key(self,actor,key_id,version,external_reference):
  self.require(actor,"key:rotate")
  if key_id in self.keys and version<=self.keys[key_id]["version"]: raise ValueError("Version must increase")
  self.keys[key_id]={"version":version,"external_reference":external_reference,"revoked":False}
  self._record("key_registered",actor,key_id,{"version":version})
 def revoke_key(self,actor,key_id):
  self.require(actor,"key:revoke")
  if key_id not in self.keys: raise KeyError(key_id)
  self.keys[key_id]["revoked"]=True; self._record("key_revoked",actor,key_id)
 def key_status(self,key_id):
  if key_id not in self.keys: raise KeyError(key_id)
  return dict(self.keys[key_id])
 def audit_events(self,user):
  self.require(user,"audit:read")
  return list(self.audit)
