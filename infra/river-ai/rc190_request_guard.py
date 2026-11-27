"""RC-190: bounded request guard prototype (SQLite, single-host scope)."""
import sqlite3,time
from dataclasses import dataclass

@dataclass(frozen=True)
class GuardDecision:
    allowed: bool
    reason: str
    retry_after_seconds: int=0

class RequestGuard:
    def __init__(self,path,window_seconds=60,max_requests=20,max_active=3,block_seconds=30):
        if window_seconds<=0 or max_requests<=0 or max_active<=0 or block_seconds<0: raise ValueError("invalid limits")
        self.path=path;self.window=window_seconds;self.limit=max_requests;self.active_limit=max_active;self.block=block_seconds
        with self._connect() as db:
            db.execute("""CREATE TABLE IF NOT EXISTS rc190_subjects(
                subject TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL,
                active INTEGER NOT NULL DEFAULT 0, blocked_until INTEGER NOT NULL DEFAULT 0)""")
    def _connect(self):
        db=sqlite3.connect(self.path,timeout=10,isolation_level=None)
        db.execute("PRAGMA busy_timeout=10000");db.execute("PRAGMA journal_mode=WAL")
        return db
    def acquire(self,subject,now=None):
        if not subject: return GuardDecision(False,"invalid_subject")
        now=int(time.time() if now is None else now)
        with self._connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row=db.execute("SELECT window_start,count,active,blocked_until FROM rc190_subjects WHERE subject=?",(subject,)).fetchone()
            if row is None: row=(now,0,0,0)
            start,count,active,blocked=row
            if blocked>now: db.rollback();return GuardDecision(False,"temporarily_blocked",blocked-now)
            if now-start>=self.window: start,count=now,0
            if count>=self.limit:
                until=now+self.block if self.block else now
                db.execute("INSERT INTO rc190_subjects VALUES(?,?,?,?,?) ON CONFLICT(subject) DO UPDATE SET window_start=excluded.window_start,count=excluded.count,active=excluded.active,blocked_until=excluded.blocked_until",(subject,start,count,active,until))
                db.commit();return GuardDecision(False,"rate_limit",max(1,until-now))
            if active>=self.active_limit:
                db.rollback();return GuardDecision(False,"concurrency_limit",1)
            count+=1;active+=1
            db.execute("INSERT INTO rc190_subjects VALUES(?,?,?,?,?) ON CONFLICT(subject) DO UPDATE SET window_start=excluded.window_start,count=excluded.count,active=excluded.active,blocked_until=excluded.blocked_until",(subject,start,count,active,blocked))
            db.commit();return GuardDecision(True,"acquired")
    def release(self,subject):
        with self._connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row=db.execute("SELECT active FROM rc190_subjects WHERE subject=?",(subject,)).fetchone()
            if not row: db.rollback();return False
            active=max(0,row[0]-1)
            db.execute("UPDATE rc190_subjects SET active=? WHERE subject=?",(active,subject));db.commit();return True
    def state(self,subject):
        with self._connect() as db:
            row=db.execute("SELECT window_start,count,active,blocked_until FROM rc190_subjects WHERE subject=?",(subject,)).fetchone()
            return row
