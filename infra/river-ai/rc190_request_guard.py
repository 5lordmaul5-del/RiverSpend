"""RC-190: bounded request guard with expiring SQLite leases (single host)."""
import sqlite3,time,uuid
from dataclasses import dataclass

@dataclass(frozen=True)
class GuardDecision:
    allowed: bool
    reason: str
    retry_after_seconds: int = 0
    lease_id: str = ""\n    fencing_token: int = 0

class RequestGuard:
    def __init__(self,path,window_seconds=60,max_requests=20,max_active=3,block_seconds=30,lease_seconds=120):
        if any(type(v) is not int for v in (window_seconds,max_requests,max_active,block_seconds,lease_seconds)): raise ValueError("limits must be integers")
        if window_seconds<=0 or max_requests<=0 or max_active<=0 or block_seconds<0 or lease_seconds<=0: raise ValueError("invalid limits")
        self.path=path;self.window=window_seconds;self.limit=max_requests;self.active_limit=max_active;self.block=block_seconds;self.lease_seconds=lease_seconds
        with self._connect() as db:
            db.execute("""CREATE TABLE IF NOT EXISTS rc190_subjects(subject TEXT PRIMARY KEY,window_start INTEGER NOT NULL,count INTEGER NOT NULL,active INTEGER NOT NULL DEFAULT 0,blocked_until INTEGER NOT NULL DEFAULT 0)""")
            db.execute("""CREATE TABLE IF NOT EXISTS rc190_leases(lease_id TEXT PRIMARY KEY,subject TEXT NOT NULL,expires_at INTEGER NOT NULL)""")
            db.execute("CREATE INDEX IF NOT EXISTS rc190_leases_subject_expiry ON rc190_leases(subject,expires_at)")\n            db.execute("""CREATE TABLE IF NOT EXISTS rc190_fences(subject TEXT PRIMARY KEY,generation INTEGER NOT NULL)""")\n            cols={row[1] for row in db.execute("PRAGMA table_info(rc190_leases)").fetchall()}\n            if "fencing_token" not in cols: db.execute("ALTER TABLE rc190_leases ADD COLUMN fencing_token INTEGER NOT NULL DEFAULT 0")
    def _connect(self):
        db=sqlite3.connect(self.path,timeout=10,isolation_level=None);db.execute("PRAGMA busy_timeout=10000");db.execute("PRAGMA journal_mode=WAL");return db
    @staticmethod
    def _valid_subject(subject): return isinstance(subject,str) and 0<len(subject)<=256 and subject.strip()==subject
    def _reap(self,db,now):
        db.execute("DELETE FROM rc190_leases WHERE expires_at<=?",(now,))
        db.execute("UPDATE rc190_subjects SET active=(SELECT COUNT(*) FROM rc190_leases WHERE rc190_leases.subject=rc190_subjects.subject)")
    def acquire(self,subject,now=None):
        if not self._valid_subject(subject):return GuardDecision(False,"invalid_subject")
        if now is not None and type(now) is not int:return GuardDecision(False,"invalid_time")
        now=int(time.time() if now is None else now)
        with self._connect() as db:
            db.execute("BEGIN IMMEDIATE");self._reap(db,now)
            row=db.execute("SELECT window_start,count,active,blocked_until FROM rc190_subjects WHERE subject=?",(subject,)).fetchone()
            if row is None:row=(now,0,0,0)
            start,count,active,blocked=row
            if blocked>now:db.rollback();return GuardDecision(False,"temporarily_blocked",blocked-now)
            if now-start>=self.window:start,count=now,0
            if count>=self.limit:
                until=now+self.block if self.block else now
                db.execute("INSERT INTO rc190_subjects VALUES(?,?,?,?,?) ON CONFLICT(subject) DO UPDATE SET window_start=excluded.window_start,count=excluded.count,active=excluded.active,blocked_until=excluded.blocked_until",(subject,start,count,active,until))
                db.commit();return GuardDecision(False,"rate_limit",max(1,until-now))
            if active>=self.active_limit:db.rollback();return GuardDecision(False,"concurrency_limit",1)
            token=uuid.uuid4().hex;expires=now+self.lease_seconds;count+=1;active+=1\n            db.execute("INSERT INTO rc190_fences(subject,generation) VALUES(?,1) ON CONFLICT(subject) DO UPDATE SET generation=generation+1",(subject,))\n            fence=db.execute("SELECT generation FROM rc190_fences WHERE subject=?",(subject,)).fetchone()[0]
            db.execute("INSERT INTO rc190_subjects VALUES(?,?,?,?,?) ON CONFLICT(subject) DO UPDATE SET window_start=excluded.window_start,count=excluded.count,active=excluded.active,blocked_until=excluded.blocked_until",(subject,start,count,active,blocked))
            db.execute("INSERT INTO rc190_leases(lease_id,subject,expires_at,fencing_token) VALUES(?,?,?,?)",(token,subject,expires,fence))
            db.commit();return GuardDecision(True,"acquired",0,token,fence)
    def is_current(self,subject,fencing_token,now=None):\n        """Check fence freshness; downstream commits must perform this check transactionally."""\n        if not self._valid_subject(subject) or type(fencing_token) is not int or fencing_token<=0:return False\n        if now is not None and type(now) is not int:return False\n        now=int(time.time() if now is None else now)\n        with self._connect() as db:\n            db.execute("BEGIN IMMEDIATE");self._reap(db,now)\n            row=db.execute("SELECT generation FROM rc190_fences WHERE subject=?",(subject,)).fetchone()\n            lease=db.execute("SELECT 1 FROM rc190_leases WHERE subject=? AND fencing_token=? AND expires_at>?",(subject,fencing_token,now)).fetchone()\n            db.commit();return bool(row and row[0]==fencing_token and lease)\n    def release(self,lease_id,now=None):
        if not isinstance(lease_id,str) or not lease_id:return False
        if now is not None and type(now) is not int:return False
        now=int(time.time() if now is None else now)
        with self._connect() as db:
            db.execute("BEGIN IMMEDIATE");row=db.execute("SELECT subject FROM rc190_leases WHERE lease_id=?",(lease_id,)).fetchone()
            if not row:db.rollback();return False
            subject=row[0];db.execute("DELETE FROM rc190_leases WHERE lease_id=?",(lease_id,))
            db.execute("UPDATE rc190_subjects SET active=(SELECT COUNT(*) FROM rc190_leases WHERE subject=? AND expires_at>?) WHERE subject=?",(subject,now,subject))
            db.commit();return True
    def reap_expired(self,now=None):
        if now is not None and type(now) is not int:raise ValueError("invalid_time")
        now=int(time.time() if now is None else now)
        with self._connect() as db:
            db.execute("BEGIN IMMEDIATE");before=db.execute("SELECT COUNT(*) FROM rc190_leases WHERE expires_at<=?",(now,)).fetchone()[0];self._reap(db,now);db.commit();return before
    def state(self,subject):
        if not self._valid_subject(subject):return None
        with self._connect() as db:return db.execute("SELECT window_start,count,active,blocked_until FROM rc190_subjects WHERE subject=?",(subject,)).fetchone()
