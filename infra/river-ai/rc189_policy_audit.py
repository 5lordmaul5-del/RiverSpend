"""RC-189: fail-closed authorization policy and audit log prototype.
Caller identity must be supplied by a trusted authentication layer, not request payload.
"""
import sqlite3, json, time
from dataclasses import dataclass

@dataclass(frozen=True)
class Principal:
    subject: str
    roles: tuple[str,...]
    authenticated: bool

@dataclass(frozen=True)
class Decision:
    allowed: bool
    reason: str

class Policy:
    def __init__(self, role_permissions: dict[str,set[str]]):
        self.role_permissions={k:set(v) for k,v in role_permissions.items()}
    def authorize(self, principal: Principal|None, action: str) -> Decision:
        if not principal or not principal.authenticated or not principal.subject:
            return Decision(False,"unauthenticated")
        if not action or action.startswith("_"):
            return Decision(False,"invalid_action")
        permissions=set()
        for role in principal.roles:
            permissions |= self.role_permissions.get(role,set())
        return Decision(action in permissions, "allowed" if action in permissions else "denied")

class AuditLog:
    def __init__(self,path):
        self.path=path
        with sqlite3.connect(path) as db:
            db.execute("""CREATE TABLE IF NOT EXISTS rc189_audit(
                event_id TEXT PRIMARY KEY, subject TEXT NOT NULL, action TEXT NOT NULL,
                decision TEXT NOT NULL, resource TEXT, details_json TEXT, created_at INTEGER NOT NULL)""")
    def record(self,event_id,subject,action,decision,resource=None,details=None):
        if not event_id or not subject or not action or decision not in ("allowed","denied"):
            raise ValueError("invalid audit fields")
        details_json=json.dumps(details,sort_keys=True,separators=(",",":")) if details is not None else None
        with sqlite3.connect(self.path) as db:
            db.execute("INSERT OR IGNORE INTO rc189_audit VALUES(?,?,?,?,?,?,?)",
                (event_id,subject,action,decision,resource,details_json,int(time.time())))
    def events(self,subject=None):
        with sqlite3.connect(self.path) as db:
            db.row_factory=sqlite3.Row
            rows=db.execute("SELECT * FROM rc189_audit WHERE subject=? ORDER BY created_at" if subject else "SELECT * FROM rc189_audit ORDER BY created_at",
                (subject,) if subject else ()).fetchall()
            return [dict(r) for r in rows]

def authorize_and_audit(policy,audit,principal,event_id,action,resource=None):
    subject=principal.subject if principal and principal.subject else "anonymous"
    decision=policy.authorize(principal,action)
    audit.record(event_id,subject,action,"allowed" if decision.allowed else "denied",resource,
                 {"reason":decision.reason})
    return decision
