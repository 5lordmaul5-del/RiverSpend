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

    def enqueue(
        self,
        capability: str,
        summary: str,
        owner: str,
        payload: dict,
        summary_limit: int = MAX_SUMMARY_CHARS,
        request_key: str | None = None,
    ) -> str:
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
        encoded = _canonical_payload(payload)
        request_sha256 = None
        if request_key is not None:
            fingerprint = json.dumps(
                {"capability": capability, "summary": summary, "payload": encoded},
                ensure_ascii=False,
                separators=(",", ":"),
                sort_keys=True,
            )
            request_sha256 = hashlib.sha256(fingerprint.encode("utf-8")).hexdigest()
        with self._db() as db:
            db.execute("BEGIN IMMEDIATE")
            # A repeat with the same owner/key and identical request returns the
            # original task before queue-capacity accounting.
            if request_key is not None:
                existing = db.execute(
                    "SELECT id,request_sha256 FROM tasks WHERE owner=? AND request_key=?",
                    (owner, request_key),
                ).fetchone()
                if existing:
                    if existing[1] != request_sha256:
                        db.rollback()
                        raise PayloadLedgerError("request key reused with different request")
                    db.commit()
                    return existing[0]
            queued = db.execute("SELECT COUNT(*) FROM tasks WHERE state='queued'").fetchone()[0]
            if queued >= self.queue_limit:
                db.rollback()
                raise OverflowError("queue capacity reached")
            tid = str(uuid.uuid4())
            db.execute(
                "INSERT INTO tasks(id,capability,summary,state,created,owner,payload_json,request_key,request_sha256) "
                "VALUES(?,?,?,'queued',?,?,?,?,?)",
                (tid, capability, summary, time.time(), owner, encoded, request_key, request_sha256),
            )
            db.commit()
            return tid

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
            db.execute(
                "UPDATE tasks SET state='queued',leased=NULL,lease_owner=NULL WHERE state='leased' AND leased < ?",
                (time.time() - self.lease_seconds,),
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
                "id": row[0],
                "capability": row[1],
                "summary": row[2],
                "attempts": row[3] + 1,
                "lease_owner": worker_id,
                "owner": row[4],
                "payload": json.loads(row[5]) if row[5] is not None else None,
            }
