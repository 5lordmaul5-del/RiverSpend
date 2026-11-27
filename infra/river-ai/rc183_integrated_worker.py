"""RC-183 local integration core: authenticated-identity contract, lease, policy, executor and durable result.

Identity verifier, policy and executor are injected boundaries; no live provider,
sandbox or external-effect executor is supplied by this module.
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
        if type(db_path) is not str or not db_path or db_path == ":memory:":
            raise ValueError("file-backed ledger path required")
        ledger_path = getattr(ledger, "db_path", None)
        if type(ledger_path) is not str or ledger_path == ":memory:":
            raise ValueError("file-backed ledger path required")
        if Path(db_path).resolve() != Path(ledger_path).resolve():
            raise ValueError("worker result DB must be the ledger DB")
        if not callable(identity_verifier) or not all(
            callable(getattr(policy, name, None)) for name in ("authorize", "finish", "refund")
        ) or not callable(getattr(executor, "execute", None)):
            raise TypeError("verifier, policy contract and executor contract required")
        self.ledger = ledger
        self.db_path = str(Path(db_path).resolve())
        self.identity_verifier = identity_verifier
        self.policy = policy
        self.executor = executor
        self.max_attempts = max_attempts
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        with self._db() as db:
            db.execute("""CREATE TABLE IF NOT EXISTS task_results (
                task_id TEXT PRIMARY KEY, owner TEXT NOT NULL DEFAULT '',
                result_json TEXT NOT NULL, result_sha256 TEXT NOT NULL,
                worker_subject TEXT NOT NULL, idempotency_key TEXT NOT NULL UNIQUE,
                completed_at REAL NOT NULL
            )""")
            result_columns = {row[1] for row in db.execute("PRAGMA table_info(task_results)")}
            if "owner" not in result_columns:
                db.execute("ALTER TABLE task_results ADD COLUMN owner TEXT NOT NULL DEFAULT ''")
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
        if type(token) is not str or not token or len(token) > 8192:
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
        if type(lease) is not dict or lease.get("lease_owner") != worker:
            return {"status": "rejected", "error": "lease_contract_invalid"}
        required = {"id", "capability", "summary", "attempts", "lease_owner", "owner", "payload"}
        if not required.issubset(lease):
            recovery = self._recover_invalid_lease(lease, worker)
            return {"status": "rejected", "error": "lease_contract_invalid", "recovery": recovery}
        task_id, kind, summary, owner, payload = (
            lease["id"], lease["capability"], lease["summary"], lease["owner"], lease["payload"]
        )
        attempt = lease["attempts"]
        valid = (
            type(task_id) is str and bool(task_id.strip()) and len(task_id) <= 128
            and type(kind) is str and bool(kind.strip()) and len(kind) <= 128
            and kind in capabilities
            and type(summary) is str and len(summary) <= 500
            and type(owner) is str and bool(owner.strip()) and len(owner) <= 128
            and type(payload) is dict
            and type(attempt) is int and attempt >= 1
        )
        if not valid:
            recovery = self._recover_invalid_lease(lease, worker)
            return {"status": "rejected", "error": "lease_contract_invalid", "recovery": recovery}
        if attempt > self.max_attempts:
            state = self._persist_failure(task_id, worker, attempt, None, error_code="attempts_exhausted")
            return {"status": "exhausted" if state == "exhausted" else state, "task_id": task_id}
        try:
            payload_json = _canonical_payload(payload)
        except Exception:
            state = self._persist_failure(task_id, worker, attempt, None, error_code="payload_invalid")
            return {"status": state, "task_id": task_id, "error": "payload_invalid"}
        payload_digest = hashlib.sha256(payload_json.encode("utf-8")).hexdigest()
        self._event(task_id, attempt, worker, "leased", payload_digest)
        authorization = None
        try:
            authorization = self.policy.authorize(
                kind, owner, worker_subject=worker, payload_sha256=payload_digest,
                idempotency_key=task_id, attempt=attempt,
            )
            if authorization is None:
                raise RuntimeError("policy_denied")
            result = self.executor.execute(kind, payload, idempotency_key=task_id)
            result_json = _canonical_payload(result)
            result_digest = hashlib.sha256(result_json.encode("utf-8")).hexdigest()
            if self.policy.finish(authorization, True) is not True:
                raise RuntimeError("policy_settlement_failed")
            if not self._persist_success(task_id, worker, attempt, payload_digest, result_json, result_digest):
                try:
                    self.policy.refund(authorization)
                except Exception:
                    pass
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

    def _recover_invalid_lease(self, lease, worker):
        """Requeue only when the returned envelope contains a safe lease binding."""
        if type(lease) is not dict or lease.get("lease_owner") != worker:
            return None
        task_id, attempt = lease.get("id"), lease.get("attempts")
        if type(task_id) is not str or not task_id.strip() or len(task_id) > 128:
            return None
        if type(attempt) is not int or attempt < 1:
            return None
        return self._persist_failure(
            task_id, worker, attempt, None, error_code="lease_contract_invalid"
        )

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
                "UPDATE tasks SET state='completed',leased=NULL,lease_owner=NULL WHERE id=? AND state='leased' AND lease_owner=? AND attempts=? AND leased>=?",
                (task_id, worker, attempt, now - self.ledger.lease_seconds),
            )
            if cur.rowcount != 1:
                db.rollback()
                self._event(task_id, attempt, worker, "lease_lost", payload_digest)
                return False
            owner_row = db.execute("SELECT owner FROM tasks WHERE id=?", (task_id,)).fetchone()
            if owner_row is None or type(owner_row[0]) is not str or not owner_row[0].strip():
                db.rollback()
                self._event(task_id, attempt, worker, "owner_missing", payload_digest)
                return False
            db.execute(
                "INSERT INTO task_results(task_id,owner,result_json,result_sha256,worker_subject,idempotency_key,completed_at) VALUES(?,?,?,?,?,?,?)",
                (task_id, owner_row[0], result_json, result_digest, worker, task_id, now),
            )
            self._event(task_id, attempt, worker, "completed", payload_digest, result_digest, db=db)
            db.commit()
            return True

    def _persist_failure(self, task_id, worker, attempt, payload_digest, error_code="worker_failed"):
        now = time.time()
        with self._db() as db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute(
                "SELECT attempts,leased FROM tasks WHERE id=? AND state='leased' AND lease_owner=? AND attempts=?",
                (task_id, worker, attempt),
            ).fetchone()
            if row is None or row[1] is None or row[1] < now - self.ledger.lease_seconds:
                db.rollback()
                self._event(task_id, attempt, worker, "lease_lost", payload_digest, error_code="stale_failure")
                return "lease_lost"
            # Retry budget is based on the persisted counter, not the lease envelope.
            persisted_attempt = row[0]
            retry = persisted_attempt < self.max_attempts
            target = "queued" if retry else "cancelled"
            action = "retry_scheduled" if retry else "attempts_exhausted"
            cur = db.execute(
                "UPDATE tasks SET state=?,leased=NULL,lease_owner=NULL WHERE id=? AND state='leased' AND lease_owner=? AND attempts=? AND leased>=?",
                (target, task_id, worker, persisted_attempt, now - self.ledger.lease_seconds),
            )
            if cur.rowcount != 1:
                db.rollback()
                self._event(task_id, persisted_attempt, worker, "lease_lost", payload_digest, error_code="stale_failure")
                return "lease_lost"
            self._event(task_id, persisted_attempt, worker, action, payload_digest, error_code=error_code, db=db)
            db.commit()
            return "retry" if retry else "exhausted"

    def get_result(self, task_id, owner):
        """Return an owner-scoped result only when its persisted digest verifies."""
        if type(owner) is not str or not owner.strip():
            return None
        with self._db() as db:
            row = db.execute(
                "SELECT result_json,result_sha256 FROM task_results WHERE task_id=? AND owner=?",
                (task_id, owner),
            ).fetchone()
        if row is None:
            return None
        digest = hashlib.sha256(row[0].encode("utf-8")).hexdigest()
        if digest != row[1]:
            return None
        return {"result": json.loads(row[0]), "sha256": row[1]}

    def events(self, task_id):
        with self._db() as db:
            rows = db.execute("SELECT attempt,worker_subject,action,payload_sha256,result_sha256,error_code,created FROM task_events WHERE task_id=? ORDER BY event_id", (task_id,)).fetchall()
        return [{"attempt":r[0],"worker":r[1],"action":r[2],"payload_sha256":r[3],"result_sha256":r[4],"error_code":r[5],"created":r[6]} for r in rows]
