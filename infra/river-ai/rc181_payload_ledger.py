"""RC-181 additive SQLite ledger extension storing bounded owner and payload metadata."""
from __future__ import annotations

import hashlib
import json
import math
import time
import uuid

from rc159_persistent_ledger import PersistentTaskLedger

MAX_PAYLOAD_BYTES = 16384
MAX_PAYLOAD_DEPTH = 32
MAX_PAYLOAD_NODES = 2048
MAX_OWNER_CHARS = 128
MAX_CAPABILITY_CHARS = 128
MAX_SUMMARY_CHARS = 500
MAX_REQUEST_KEY_CHARS = 128
_FORBIDDEN_KEYS = {"__proto__", "prototype", "constructor"}


class PayloadLedgerError(ValueError):
    pass


class RequestKeyConflict(PayloadLedgerError):
    """A request key was reused with a different canonical request."""


def _canonical_payload(payload: object) -> str:
    """Validate a bounded JSON data tree and return deterministic JSON."""
    if type(payload) is not dict:
        raise PayloadLedgerError("payload must be an object")

    nodes = 0
    active = set()

    def walk(value: object, depth: int) -> None:
        nonlocal nodes
        nodes += 1
        if nodes > MAX_PAYLOAD_NODES:
            raise PayloadLedgerError("payload node limit exceeded")
        if depth > MAX_PAYLOAD_DEPTH:
            raise PayloadLedgerError("payload depth limit exceeded")

        value_type = type(value)
        if value is None or value_type is bool or value_type is str or value_type is int:
            return
        if value_type is float:
            if not math.isfinite(value):
                raise PayloadLedgerError("non-finite number")
            return
        if value_type is list:
            identity = id(value)
            if identity in active:
                raise PayloadLedgerError("payload cycle")
            active.add(identity)
            try:
                for item in value:
                    walk(item, depth + 1)
            finally:
                active.remove(identity)
            return
        if value_type is dict:
            identity = id(value)
            if identity in active:
                raise PayloadLedgerError("payload cycle")
            active.add(identity)
            try:
                for key, item in value.items():
                    if type(key) is not str:
                        raise PayloadLedgerError("object keys must be strings")
                    if key in _FORBIDDEN_KEYS:
                        raise PayloadLedgerError("prototype-sensitive key")
                    walk(item, depth + 1)
            finally:
                active.remove(identity)
            return
        raise PayloadLedgerError("unsupported payload value")

    walk(payload, 0)
    try:
        encoded = json.dumps(
            payload,
            ensure_ascii=False,
            separators=(",", ":"),
            sort_keys=True,
            allow_nan=False,
        )
        size = len(encoded.encode("utf-8"))
    except (TypeError, ValueError, UnicodeEncodeError, RecursionError):
        raise PayloadLedgerError("payload serialization invalid") from None
    if size > MAX_PAYLOAD_BYTES:
        raise PayloadLedgerError("payload too large")
    return encoded


class PayloadPersistentTaskLedger(PersistentTaskLedger):
    def __init__(self, db_path: str, queue_limit: int = 500, lease_seconds: int = 120):
        super().__init__(db_path, queue_limit, lease_seconds)
        with self._db() as db:
            columns = {row[1] for row in db.execute("PRAGMA table_info(tasks)")}
            if "owner" not in columns:
                db.execute("ALTER TABLE tasks ADD COLUMN owner TEXT")
            if "payload_json" not in columns:
                db.execute("ALTER TABLE tasks ADD COLUMN payload_json TEXT")
            if "request_key" not in columns:
                db.execute("ALTER TABLE tasks ADD COLUMN request_key TEXT")
            if "request_sha256" not in columns:
                db.execute("ALTER TABLE tasks ADD COLUMN request_sha256 TEXT")
            db.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS tasks_owner_request_key "
                "ON tasks(owner,request_key) WHERE request_key IS NOT NULL"
            )
            db.execute("""CREATE TABLE IF NOT EXISTS intake_audit_events (
                event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id TEXT,
                actor_subject TEXT,
                action TEXT NOT NULL,
                request_key_sha256 TEXT,
                request_sha256 TEXT,
                created REAL NOT NULL
            )""")
            db.execute("CREATE INDEX IF NOT EXISTS intake_audit_task ON intake_audit_events(task_id,event_id)")
            db.execute("""CREATE TABLE IF NOT EXISTS task_events (
                event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id TEXT NOT NULL,
                attempt INTEGER NOT NULL,
                worker_subject TEXT NOT NULL,
                action TEXT NOT NULL,
                payload_sha256 TEXT,
                result_sha256 TEXT,
                error_code TEXT,
                created REAL NOT NULL
            )""")
            db.execute("CREATE INDEX IF NOT EXISTS task_events_task ON task_events(task_id,event_id)")

    @staticmethod
    def _audit_insert(db, task_id, actor, action, key_digest, request_digest):
        db.execute(
            "INSERT INTO intake_audit_events(task_id,actor_subject,action,request_key_sha256,request_sha256,created) "
            "VALUES(?,?,?,?,?,?)",
            (task_id, actor, action, key_digest, request_digest, time.time()),
        )

    def record_intake_event(self, actor_subject, action, request_key_sha256=None, request_sha256=None, task_id=None):
        """Persist an authenticated or anonymous intake decision without logging tokens or payloads."""
        if actor_subject is not None and (
            type(actor_subject) is not str or not actor_subject.strip() or len(actor_subject) > MAX_OWNER_CHARS
        ):
            raise PayloadLedgerError("invalid audit actor")
        if type(action) is not str or not action or len(action) > 64:
            raise PayloadLedgerError("invalid audit action")
        for digest in (request_key_sha256, request_sha256):
            if digest is not None and (
                type(digest) is not str or len(digest) != 64
                or any(ch not in "0123456789abcdef" for ch in digest)
            ):
                raise PayloadLedgerError("invalid audit digest")
        if task_id is not None and (type(task_id) is not str or not task_id or len(task_id) > 128):
            raise PayloadLedgerError("invalid audit task id")
        with self._db() as db:
            db.execute("BEGIN IMMEDIATE")
            self._audit_insert(db, task_id, actor_subject, action, request_key_sha256, request_sha256)
            db.commit()

    def intake_events(self, task_id=None):
        with self._db() as db:
            if task_id is None:
                rows = db.execute(
                    "SELECT task_id,actor_subject,action,request_key_sha256,request_sha256,created "
                    "FROM intake_audit_events ORDER BY event_id"
                ).fetchall()
            else:
                rows = db.execute(
                    "SELECT task_id,actor_subject,action,request_key_sha256,request_sha256,created "
                    "FROM intake_audit_events WHERE task_id=? ORDER BY event_id", (task_id,)
                ).fetchall()
        return [
            {"task_id":r[0],"actor":r[1],"action":r[2],"request_key_sha256":r[3],
             "request_sha256":r[4],"created":r[5]}
            for r in rows
        ]

    def enqueue(
        self,
        capability: str,
        summary: str,
        owner: str,
        payload: dict,
        summary_limit: int = MAX_SUMMARY_CHARS,
        request_key: str | None = None,
        audit_actor: str | None = None,
        return_status: bool = False,
    ) -> str | tuple[str, str]:
        if type(owner) is not str or not owner.strip() or len(owner) > MAX_OWNER_CHARS:
            raise PayloadLedgerError("invalid owner")
        if type(capability) is not str or not capability.strip() or len(capability) > MAX_CAPABILITY_CHARS:
            raise PayloadLedgerError("capability required or invalid")
        if type(summary) is not str or type(summary_limit) is not int or not 1 <= summary_limit <= MAX_SUMMARY_CHARS or len(summary) > summary_limit:
            raise PayloadLedgerError("summary invalid/too long")
        if request_key is not None and (
            type(request_key) is not str or not request_key.strip()
            or len(request_key) > MAX_REQUEST_KEY_CHARS
        ):
            raise PayloadLedgerError("invalid request key")
        if audit_actor is not None and (
            type(audit_actor) is not str or not audit_actor.strip()
            or len(audit_actor) > MAX_OWNER_CHARS or audit_actor != owner
        ):
            raise PayloadLedgerError("audit actor must match owner")
        if type(return_status) is not bool:
            raise PayloadLedgerError("return_status must be boolean")
        encoded = _canonical_payload(payload)
        request_sha256 = None
        key_digest = None
        if request_key is not None:
            fingerprint = json.dumps(
                {"capability": capability, "summary": summary, "payload": encoded},
                ensure_ascii=False, separators=(",", ":"), sort_keys=True,
            )
            request_sha256 = hashlib.sha256(fingerprint.encode("utf-8")).hexdigest()
            key_digest = hashlib.sha256(request_key.encode("utf-8")).hexdigest()
        with self._db() as db:
            db.execute("BEGIN IMMEDIATE")
            if request_key is not None:
                existing = db.execute(
                    "SELECT id,request_sha256 FROM tasks WHERE owner=? AND request_key=?",
                    (owner, request_key),
                ).fetchone()
                if existing:
                    if existing[1] != request_sha256:
                        if audit_actor is not None:
                            self._audit_insert(db, existing[0], audit_actor, "request_key_conflict", key_digest, request_sha256)
                            db.commit()
                        else:
                            db.rollback()
                        raise RequestKeyConflict("request key reused with different request")
                    if audit_actor is not None:
                        self._audit_insert(db, existing[0], audit_actor, "intake_replayed", key_digest, request_sha256)
                    db.commit()
                    return (existing[0], "replayed") if return_status else existing[0]
            queued = db.execute("SELECT COUNT(*) FROM tasks WHERE state='queued'").fetchone()[0]
            if queued >= self.queue_limit:
                if audit_actor is not None:
                    self._audit_insert(db, None, audit_actor, "queue_full", key_digest, request_sha256)
                    db.commit()
                else:
                    db.rollback()
                raise OverflowError("queue capacity reached")
            tid = str(uuid.uuid4())
            db.execute(
                "INSERT INTO tasks(id,capability,summary,state,created,owner,payload_json,request_key,request_sha256) "
                "VALUES(?,?,?,'queued',?,?,?,?,?)",
                (tid, capability, summary, time.time(), owner, encoded, request_key, request_sha256),
            )
            if audit_actor is not None:
                self._audit_insert(db, tid, audit_actor, "intake_accepted", key_digest, request_sha256)
            db.commit()
            return (tid, "accepted") if return_status else tid

    def lease_next(self, worker_id: str, allowed_capabilities: tuple[str, ...]) -> dict | None:
        if type(worker_id) is not str or not worker_id.strip() or len(worker_id) > MAX_OWNER_CHARS:
            raise ValueError("worker id required or invalid")
        if type(allowed_capabilities) is not tuple or len(allowed_capabilities) > 128:
            raise ValueError("capabilities must be a bounded tuple")
        if any(type(cap) is not str or not cap.strip() or len(cap) > MAX_CAPABILITY_CHARS for cap in allowed_capabilities):
            raise ValueError("invalid capability")
        if not allowed_capabilities:
            return None
        with self._db() as db:
            db.execute("BEGIN IMMEDIATE")
            cutoff = time.time() - self.lease_seconds
            expired = db.execute(
                "SELECT id,attempts,lease_owner,leased FROM tasks WHERE state='leased' AND leased < ?",
                (cutoff,),
            ).fetchall()
            db.execute(
                "UPDATE tasks SET state='queued',leased=NULL,lease_owner=NULL WHERE state='leased' AND leased < ?",
                (cutoff,),
            )
            # Record recovery atomically with the requeue so a reclaimed lease
            # cannot disappear from the durable worker audit trail.
            for task_id, attempt, old_worker, old_lease_at in expired:
                db.execute(
                    "INSERT INTO task_events(task_id,attempt,worker_subject,action,error_code,created) "
                    "VALUES(?,?,?,?,?,?)",
                    (task_id, attempt if type(attempt) is int and attempt >= 0 else 0,
                     old_worker if type(old_worker) is str and old_worker else "unknown",
                     "lease_expired_requeued", "lease_expired", time.time()),
                )
            placeholders = ",".join("?" for _ in allowed_capabilities)
            row = db.execute(
                f"SELECT id,capability,summary,attempts,owner,payload_json FROM tasks WHERE state='queued' AND capability IN ({placeholders}) ORDER BY created LIMIT 1",
                allowed_capabilities,
            ).fetchone()
            if not row:
                db.commit()
                return None
            now = time.time()
            db.execute(
                "UPDATE tasks SET state='leased',leased=?,lease_owner=?,attempts=attempts+1 WHERE id=? AND state='queued'",
                (now, worker_id, row[0]),
            )
            db.commit()
            return {
                "id": row[0], "capability": row[1], "summary": row[2],
                "attempts": row[3] + 1, "lease_owner": worker_id, "leased_at": now,
                "owner": row[4], "payload": json.loads(row[5]) if row[5] is not None else None,
            }
