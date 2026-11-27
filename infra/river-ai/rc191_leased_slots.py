"""RC-191: expiring concurrency leases with heartbeat/reclaim (SQLite prototype)."""
import sqlite3,time,secrets
from dataclasses import dataclass
@dataclass(frozen=True)
class Lease:
 subject:str
 lease_id:str
 expires_at:int
@dataclass(frozen=True)
class LeaseDecision:
 allowed:bool
 reason:str
 lease:Lease|None=None
 retry_after:int=0
class LeaseSlots:
 def __init__(self,path,max_active=3,lease_seconds=30):
  if max_active<=0 or lease_seconds<=0:raise ValueError("limits must be positive")
  self.path=path;self.max_active=max_active;self.duration=lease_seconds
  with self._db() as d:d.execute("""CREATE TABLE IF NOT EXISTS rc191_leases(
    lease_id TEXT PRIMARY KEY,subject TEXT NOT NULL,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL)""")
 def _db(self):
  d=sqlite3.connect(self.path,timeout=10,isolation_level=None);d.execute("PRAGMA busy_timeout=10000");d.execute("PRAGMA journal_mode=WAL");return d
 def acquire(self,subject,now=None):
  if not subject:return LeaseDecision(False,"invalid_subject")
  now=int(time.time() if now is None else now)
  with self._db() as d:
   d.execute("BEGIN IMMEDIATE")
   d.execute("DELETE FROM rc191_leases WHERE expires_at<=?",(now,))
   n=d.execute("SELECT COUNT(*) FROM rc191_leases WHERE subject=?",(subject,)).fetchone()[0]
   if n>=self.max_active:
    exp=d.execute("SELECT MIN(expires_at) FROM rc191_leases WHERE subject=?",(subject,)).fetchone()[0]
    d.rollback();return LeaseDecision(False,"concurrency_limit",retry_after=max(1,exp-now))
   lid=secrets.token_urlsafe(24);exp=now+self.duration
   d.execute("INSERT INTO rc191_leases VALUES(?,?,?,?)",(lid,subject,exp,now));d.commit()
   return LeaseDecision(True,"acquired",Lease(subject,lid,exp))
 def heartbeat(self,lease_id,subject,now=None):
  now=int(time.time() if now is None else now);exp=now+self.duration
  with self._db() as d:
   d.execute("BEGIN IMMEDIATE")
   row=d.execute("SELECT subject,expires_at FROM rc191_leases WHERE lease_id=?",(lease_id,)).fetchone()
   if not row or row[0]!=subject or row[1]<=now:d.rollback();return None
   d.execute("UPDATE rc191_leases SET expires_at=? WHERE lease_id=?",(exp,lease_id));d.commit()
   return Lease(subject,lease_id,exp)
 def release(self,lease_id,subject,now=None):
  now=int(time.time() if now is None else now)
  with self._db() as d:
   d.execute("BEGIN IMMEDIATE")
   cur=d.execute("DELETE FROM rc191_leases WHERE lease_id=? AND subject=? AND expires_at>?",(lease_id,subject,now))
   d.commit();return cur.rowcount==1
 def active(self,subject=None,now=None):
  now=int(time.time() if now is None else now)
  with self._db() as d:
   d.execute("DELETE FROM rc191_leases WHERE expires_at<=?",(now,))
   rows=d.execute("SELECT lease_id,subject,expires_at FROM rc191_leases WHERE expires_at>?"+(" AND subject=?" if subject else "")+" ORDER BY expires_at",(now,subject) if subject else (now,)).fetchall()
   return [Lease(s,l,e) for l,s,e in rows]
