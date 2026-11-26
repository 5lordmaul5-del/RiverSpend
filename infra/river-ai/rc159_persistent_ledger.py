"""RC-159 persistent task ledger using SQLite (stdlib only).

This stores task metadata and provides atomic lease operations. It does NOT execute tasks.
"""
from __future__ import annotations
import sqlite3, time, uuid
from contextlib import contextmanager
from pathlib import Path

class PersistentTaskLedger:
    def __init__(self, db_path: str, queue_limit: int = 500, lease_seconds: int = 120):
        if queue_limit < 1 or lease_seconds < 1: raise ValueError("limits must be positive")
        self.db_path, self.queue_limit, self.lease_seconds = str(db_path), queue_limit, lease_seconds
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        with self._db() as db:
            db.execute("""CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY, capability TEXT NOT NULL, summary TEXT NOT NULL,
                state TEXT NOT NULL CHECK(state IN ('queued','leased','completed','cancelled')),
                created REAL NOT NULL, leased REAL, lease_owner TEXT, attempts INTEGER NOT NULL DEFAULT 0
            )""")
            db.execute("CREATE INDEX IF NOT EXISTS tasks_state_created ON tasks(state, created)")

    @contextmanager
    def _db(self):
        """Yield a configured connection and always close it, even on errors."""
        db = sqlite3.connect(self.db_path, timeout=10, isolation_level=None)
        try:
            db.execute("PRAGMA journal_mode=WAL")
            db.execute("PRAGMA busy_timeout=10000")
            yield db
        finally:
            db.close()

    def enqueue(self, capability: str, summary: str, summary_limit: int=500) -> str:
        if not capability or not capability.strip(): raise ValueError("capability required")
        if not isinstance(summary,str) or len(summary)>summary_limit: raise ValueError("summary invalid/too long")
        with self._db() as db:
            db.execute("BEGIN IMMEDIATE")
            queued=db.execute("SELECT COUNT(*) FROM tasks WHERE state='queued'").fetchone()[0]
            if queued >= self.queue_limit:
                db.rollback(); raise OverflowError("queue capacity reached")
            tid=str(uuid.uuid4())
            db.execute("INSERT INTO tasks(id,capability,summary,state,created) VALUES(?,?,?,'queued',?)",(tid,capability,summary,time.time()))
            db.commit()
            return tid

    def lease_next(self, worker_id: str, allowed_capabilities: tuple[str,...]) -> dict|None:
        if not worker_id or not worker_id.strip(): raise ValueError("worker id required")
        if not allowed_capabilities: return None
        with self._db() as db:
            db.execute("BEGIN IMMEDIATE")
            # Expired leases return to queue; no automatic task execution is performed.
            db.execute("UPDATE tasks SET state='queued',leased=NULL,lease_owner=NULL WHERE state='leased' AND leased < ?",(time.time()-self.lease_seconds,))
            placeholders=','.join('?' for _ in allowed_capabilities)
            row=db.execute(f"SELECT id,capability,summary,attempts FROM tasks WHERE state='queued' AND capability IN ({placeholders}) ORDER BY created LIMIT 1",allowed_capabilities).fetchone()
            if not row: db.commit(); return None
            now=time.time()
            db.execute("UPDATE tasks SET state='leased',leased=?,lease_owner=?,attempts=attempts+1 WHERE id=? AND state='queued'",(now,worker_id,row[0]))
            db.commit()
            return {"id":row[0],"capability":row[1],"summary":row[2],"attempts":row[3]+1,"lease_owner":worker_id}

    def complete(self, task_id: str, worker_id: str) -> bool:
        with self._db() as db:
            cur=db.execute("UPDATE tasks SET state='completed',leased=NULL,lease_owner=NULL WHERE id=? AND state='leased' AND lease_owner=? AND leased >= ?",(task_id,worker_id,time.time()-self.lease_seconds))
            return cur.rowcount==1

    def cancel(self, task_id: str) -> bool:
        with self._db() as db:
            cur=db.execute("UPDATE tasks SET state='cancelled',leased=NULL,lease_owner=NULL WHERE id=? AND state IN ('queued','leased')",(task_id,))
            return cur.rowcount==1

    def status(self) -> dict:
        with self._db() as db:
            rows=db.execute("SELECT state,COUNT(*) FROM tasks GROUP BY state").fetchall()
        counts={s:n for s,n in rows}
        return {k:counts.get(k,0) for k in ('queued','leased','completed','cancelled')}
