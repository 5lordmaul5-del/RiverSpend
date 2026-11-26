"""RC-183 local integration core: authenticated-identity contract, lease, policy, executor and durable result.

The identity verifier, policy and executor are injected boundaries. This module does
not provide a real identity provider, sandbox, or external-effect executor.
"""
from __future__ import annotations

import hashlib
import json
import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path

from rc181_payload_ledger import _canonical_payload


class WorkerCore:
    def __init__(self, ledger, db_path, identity_verifier, policy, executor, max_attempts=3):
        if type(max_attempts) is not int or not 1 <= max_attempts <= 20:
            raise ValueError("invalid max attempts")
        self.ledger = ledger
        self.db_path = str(db_path)
        self.identity_verifier = identity_verifier
        self.policy = policy
        self.executor = executor
        self.max_attempts = max_attempts
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        with self._db() as db:
            db.execute("""CREATE TABLE IF NOT EXISTS task_results (
                task_id TEXT PRIMARY KEY, result_json TEXT NOT NULL,
                result_sha256 TEXT NOT NULL, worker_subject TEXT NOT NULL,
                idempotency_key TEXT NOT NULL UNIQUE, completed_at REAL NOT NULL
            )""")
            db.execute("""CREATE TABLE IF NOT EXISTS task_events (
                event_id INTEGER PRIMARY KEY AUTOINCREMENT, task_id TEXT NOT NULL,
                attempt INTEGER NOT NULL, worker_subject TEXT NOT NULL,
                action TEXT NOT NULL, payload_sha256 TEXT,
                result_sha256 TEXT, error_code TEXT, created REAL NOT NULL
            )""")

    @contextmanager
    def _db(self):
        db = sqlite3.connect(self.db_path, timeout=10, isolation_level=None)
        try:
            db.execute("PRAGMA busy_timeout=10000")
            db.execute("PRAGMA journal_mode=WAL")
            yield db
        finally:
            db.close()

    @staticmethod
    def _claims(token, verifier):
        if type(token) is not str or not token:
            return None
        try:
            claims = verifier(token)
        except Exception:
            return None
        if type(claims) is not dict or set(claims) != {"subject", "capabilities"}:
            return None
        subject, caps = claims["subject"], claims["capabilities"]
        if type(subject) is not str or not subject.strip() or len(subject) > 128:
            return None
        if type(caps) is not list or len(caps) > 128:
            return None
        if any(type(c) is not str or not c.strip() or len(c) > 128 for c in caps):
            return None
        if len(set(caps)) != len(caps):
            return None
        return subject, tuple(caps)

    def run_once(self, token):
        verified = self._claims(token, self.identity_verifier)
        if verified is None:
            return {"status": "denied", "error": "worker_identity_invalid"}
        worker, capabilities = verified
        lease = self.ledger.lease_next(worker, capabilities)
        if lease is None:
            return {"status": "idle"}
        required = {"id", "capability", "summary", "attempts", "lease_owner", "owner", "payload"}
        if type(lease) is not dict or not required.issubset(lease) or lease.get("lease_owner") != worker:
            return {"status": "rejected", "error": "lease_contract_invalid"}
        task_id, kind, owner, payload = lease["id"], lease["capability"], lease["owner"], lease["payload"]
        attempt = lease["attempts"]
        if (type(task_id) is not str or type(kind) is not str or kind not in capabilities
                or type(owner) is not str or type(payload) is not dict
                or type(attempt) is not int or attempt < 1):
            return {"status": "rejected", "error": "lease_contract_invalid"}
        try:
            payload_json = _canonical_payload(payload)
        except Exception:
            return {"status": "rejected", "error": "payload_invalid"}
        payload_digest = hashlib.sha256(payload_json.encode("utf-8")).hexdigest()
        self._event(task_id, attempt, worker, "leased", payload_digest)
        authorization = None
        try:
            authorization = self.policy.authorize(
                kind, owner, worker_subject=worker, payload_sha256=payload_digest,
                idempotency_key=task_id, attempt=attempt,
            )
            result = self.executor.execute(kind, payload, idempotency_key=task_id)
            result_json = _canonical_payload(result)
            result_digest = hashlib.sha256(result_json.encode("utf-8")).hexdigest()
            self.policy.finish(authorization, True)
            if not self._persist_success(task_id, worker, attempt, payload_digest, result_json, result_digest):
                return {"status": "lease_lost", "task_id": task_id}
            return {"status": "completed", "task_id": task_id, "result_sha256": result_digest}
        except Exception:
            if authorization is not None:
                try:
                    self.policy.refund(authorization)
                except Exception:
                    pass
            state = self._persist_failure(task_id, worker, attempt, payload_digest)
            return {"status": state, "task_id": task_id, "error": "worker_failed"}

    def _event(self, task_id, attempt, worker, action, payload_digest=None,
               result_digest=None, error_code=None, db=None):
        sql = "INSERT INTO task_events(task_id,attempt,worker_subject,action,payload_sha256,result_sha256,error_code,created) VALUES(?,?,?,?,?,?,?,?)"
        values = (task_id, attempt, worker, action, payload_digest, result_digest, error_code, time.time())
        if db is not None:
            db.execute(sql, values)
        else:
            with self._db() as conn:
                conn.execute(sql, values)

    def _persist_success(self, task_id, worker, attempt, payload_digest, result_json, result_digest):
        now = time.time()
        with self._db() as db:
            db.execute("BEGIN IMMEDIATE")
            cur = db.execute(
                "UPDATE tasks SET state='completed',leased=NULL,lease_owner=NULL WHERE id=? AND state='leased' AND lease_owner=? AND leased>=?",
                (task_id, worker, now - self.ledger.lease_seconds),
            )
            if cur.rowcount != 1:
                db.rollback()
                self._event(task_id, attempt, worker, "lease_lost", payload_digest)
                return False
            db.execute(
                "INSERT INTO task_results(task_id,result_json,result_sha256,worker_subject,idempotency_key,completed_at) VALUES(?,?,?,?,?,?)",
                (task_id, result_json, result_digest, worker, task_id, now),
            )
            self._event(task_id, attempt, worker, "completed", payload_digest, result_digest, db=db)
            db.commit()
            return True

    def _persist_failure(self, task_id, worker, attempt, payload_digest):
        now = time.time()
        retry = attempt < self.max_attempts
        target = "queued" if retry else "cancelled"
        action = "retry_scheduled" if retry else "attempts_exhausted"
        with self._db() as db:
            db.execute("BEGIN IMMEDIATE")
            cur = db.execute(
                "UPDATE tasks SET state=?,leased=NULL,lease_owner=NULL WHERE id=? AND state='leased' AND lease_owner=? AND leased>=?",
                (target, task_id, worker, now - self.ledger.lease_seconds),
            )
            if cur.rowcount != 1:
                db.rollback()
                self._event(task_id, attempt, worker, "lease_lost", payload_digest, error_code="stale_failure")
                return "lease_lost"
            self._event(task_id, attempt, worker, action, payload_digest, error_code="worker_failed", db=db)
            db.commit()
            return "retry" if retry else "exhausted"

    def get_result(self, task_id):
        with self._db() as db:
            row = db.execute("SELECT result_json,result_sha256 FROM task_results WHERE task_id=?", (task_id,)).fetchone()
        if row is None:
            return None
        return {"result": json.loads(row[0]), "sha256": row[1]}

    def events(self, task_id):
        with self._db() as db:
            rows = db.execute("SELECT attempt,worker_subject,action,payload_sha256,result_sha256,error_code,created FROM task_events WHERE task_id=? ORDER BY event_id", (task_id,)).fetchall()
        return [{"attempt":r[0],"worker":r[1],"action":r[2],"payload_sha256":r[3],"result_sha256":r[4],"error_code":r[5],"created":r[6]} for r in rows]
