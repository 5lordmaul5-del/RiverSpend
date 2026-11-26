"""RC-181 additive SQLite ledger extension storing bounded owner and payload metadata."""
from __future__ import annotations
import json, time, uuid
from rc159_persistent_ledger import PersistentTaskLedger
MAX_PAYLOAD_BYTES=16384
MAX_OWNER_CHARS=128
class PayloadLedgerError(ValueError): pass
class PayloadPersistentTaskLedger(PersistentTaskLedger):
    def __init__(self, db_path: str, queue_limit: int=500, lease_seconds: int=120):
        super().__init__(db_path,queue_limit,lease_seconds)
        with self._db() as db:
            columns={row[1] for row in db.execute("PRAGMA table_info(tasks)")}
            if "owner" not in columns: db.execute("ALTER TABLE tasks ADD COLUMN owner TEXT")
            if "payload_json" not in columns: db.execute("ALTER TABLE tasks ADD COLUMN payload_json TEXT")
    def enqueue(self, capability: str, summary: str, owner: str, payload: dict, summary_limit: int=500) -> str:
        if not isinstance(owner,str) or not owner.strip() or len(owner)>MAX_OWNER_CHARS: raise PayloadLedgerError("invalid owner")
        if not isinstance(payload,dict): raise PayloadLedgerError("payload must be an object")
        try: encoded=json.dumps(payload,ensure_ascii=False,separators=(",",":"),sort_keys=True)
        except (TypeError,ValueError): raise PayloadLedgerError("payload serialization invalid") from None
        if len(encoded.encode("utf-8"))>MAX_PAYLOAD_BYTES: raise PayloadLedgerError("payload too large")
        if not capability or not capability.strip(): raise PayloadLedgerError("capability required")
        if not isinstance(summary,str) or len(summary)>summary_limit: raise PayloadLedgerError("summary invalid/too long")
        with self._db() as db:
            db.execute("BEGIN IMMEDIATE")
            queued=db.execute("SELECT COUNT(*) FROM tasks WHERE state='queued'").fetchone()[0]
            if queued>=self.queue_limit: db.rollback(); raise OverflowError("queue capacity reached")
            tid=str(uuid.uuid4())
            db.execute("INSERT INTO tasks(id,capability,summary,state,created,owner,payload_json) VALUES(?,?,?,'queued',?,?,?)",(tid,capability,summary,time.time(),owner,encoded))
            db.commit(); return tid
    def lease_next(self,worker_id: str,allowed_capabilities: tuple[str,...])->dict|None:
        if not worker_id or not worker_id.strip(): raise ValueError("worker id required")
        if not allowed_capabilities:return None
        with self._db() as db:
            db.execute("BEGIN IMMEDIATE")
            db.execute("UPDATE tasks SET state='queued',leased=NULL,lease_owner=NULL WHERE state='leased' AND leased < ?",(time.time()-self.lease_seconds,))
            placeholders=','.join('?' for _ in allowed_capabilities)
            row=db.execute(f"SELECT id,capability,summary,attempts,owner,payload_json FROM tasks WHERE state='queued' AND capability IN ({placeholders}) ORDER BY created LIMIT 1",allowed_capabilities).fetchone()
            if not row: db.commit(); return None
            now=time.time();db.execute("UPDATE tasks SET state='leased',leased=?,lease_owner=?,attempts=attempts+1 WHERE id=? AND state='queued'",(now,worker_id,row[0]));db.commit()
            return {"id":row[0],"capability":row[1],"summary":row[2],"attempts":row[3]+1,"lease_owner":worker_id,"owner":row[4],"payload":json.loads(row[5]) if row[5] is not None else None}
