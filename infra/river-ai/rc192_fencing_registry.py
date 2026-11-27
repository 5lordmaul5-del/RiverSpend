"""RC-192 local fencing registry prototype.

Tokens are monotonically increasing per resource. Downstream systems must enforce
the token atomically with their own side effects for end-to-end fencing.
"""
from __future__ import annotations
import sqlite3, time, uuid
from dataclasses import dataclass

@dataclass(frozen=True)
class FenceLease:
    resource: str
    lease_id: str
    token: int
    expires_at: float

class FenceRegistry:
    def __init__(self, path: str = ":memory:", clock=time.time):
        self.path, self.clock = path, clock
        self.db = sqlite3.connect(path, isolation_level=None)
        self.db.execute("PRAGMA busy_timeout=5000")
        self.db.execute("""CREATE TABLE IF NOT EXISTS fence_state(
            resource TEXT PRIMARY KEY, token INTEGER NOT NULL, lease_id TEXT,
            expires_at REAL)""")

    def acquire(self, resource: str, ttl: float) -> FenceLease:
        if not resource or ttl <= 0: raise ValueError("resource and positive ttl required")
        now=self.clock(); expiry=now+ttl; lid=str(uuid.uuid4())
        self.db.execute("BEGIN IMMEDIATE")
        try:
            row=self.db.execute("SELECT token,expires_at FROM fence_state WHERE resource=?",(resource,)).fetchone()
            if row and row[1] is not None and row[1] > now:
                raise RuntimeError("resource already leased")
            token=(row[0]+1) if row else 1
            self.db.execute("""INSERT INTO fence_state(resource,token,lease_id,expires_at)
                VALUES(?,?,?,?) ON CONFLICT(resource) DO UPDATE SET
                token=excluded.token,lease_id=excluded.lease_id,expires_at=excluded.expires_at""",
                (resource,token,lid,expiry))
            self.db.execute("COMMIT")
            return FenceLease(resource,lid,token,expiry)
        except Exception:
            self.db.execute("ROLLBACK"); raise

    def validate(self, lease: FenceLease) -> bool:
        row=self.db.execute("SELECT token,lease_id,expires_at FROM fence_state WHERE resource=?",
                            (lease.resource,)).fetchone()
        return bool(row and row[0]==lease.token and row[1]==lease.lease_id
                    and row[2] is not None and row[2]>self.clock())

    def assert_valid(self, lease: FenceLease) -> None:
        if not self.validate(lease): raise RuntimeError("stale or expired fencing lease")

    def release(self, lease: FenceLease) -> bool:
        self.db.execute("BEGIN IMMEDIATE")
        try:
            cur=self.db.execute("""UPDATE fence_state SET lease_id=NULL,expires_at=NULL
                WHERE resource=? AND token=? AND lease_id=?""",
                (lease.resource,lease.token,lease.lease_id))
            self.db.execute("COMMIT")
            return cur.rowcount==1
        except Exception:
            self.db.execute("ROLLBACK"); raise

    def close(self): self.db.close()
