"""RC214 prototype: role-scoped key registry and access auditing.
This is policy scaffolding, not a production key vault.
"""
from dataclasses import dataclass
from datetime import datetime, timezone
import secrets

ROLES={"admin","agent","operator","viewer"}
@dataclass
class KeyRecord:
    key_id:str
    purpose:str
    status:str="active"
    created_utc:str=""

class KeyAccessRegistry:
    def __init__(self):
        self._records={}
        self._permissions={}
        self._audit=[]
    def create_record(self,purpose,actor_role):
        if actor_role!="admin": raise PermissionError("Only admin can register key metadata.")
        kid="rk_"+secrets.token_hex(8)
        rec=KeyRecord(kid,purpose,"active",datetime.now(timezone.utc).isoformat())
        self._records[kid]=rec
        self._audit_event(actor_role,"register",kid,"allow")
        return rec
    def grant(self,key_id,role,actor_role):
        if actor_role!="admin": raise PermissionError("Only admin can grant access.")
        if role not in ROLES or key_id not in self._records: raise ValueError("Invalid role or key ID.")
        if self._records[key_id].status!="active": raise ValueError("Key record inactive.")
        self._permissions.setdefault(key_id,set()).add(role)
        self._audit_event(actor_role,"grant",key_id,role)
    def revoke(self,key_id,role,actor_role):
        if actor_role!="admin": raise PermissionError("Only admin can revoke access.")
        if key_id not in self._records or role not in ROLES: raise ValueError("Invalid role or key ID.")
        self._permissions.setdefault(key_id,set()).discard(role)
        self._audit_event(actor_role,"revoke",key_id,role)
    def authorize(self,key_id,role,operation="use"):
        allowed=(key_id in self._records and self._records[key_id].status=="active" and role in self._permissions.get(key_id,set()))
        self._audit_event(role,operation,key_id,"allow" if allowed else "deny")
        return bool(allowed)
    def deactivate(self,key_id,actor_role):
        if actor_role!="admin": raise PermissionError("Only admin can deactivate key metadata.")
        if key_id not in self._records: raise ValueError("Unknown key.")
        self._records[key_id].status="revoked"
        self._permissions[key_id].clear()
        self._audit_event(actor_role,"deactivate",key_id,"revoked")
    def audit_log(self):
        return list(self._audit)
    def _audit_event(self,actor,action,key_id,result):
        self._audit.append({"utc":datetime.now(timezone.utc).isoformat(),"actor_role":actor,"action":action,"key_id":key_id,"result":result})
