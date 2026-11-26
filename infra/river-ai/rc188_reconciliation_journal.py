"""RC-188: idempotent execution/reconciliation journal (local SQLite prototype).
This module records outcomes; it does not coordinate distributed workers or payments.
"""
from __future__ import annotations
import sqlite3, json, time
from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class JournalRecord:
    operation_id: str
    state: str
    reserved_tokens: int
    observed_tokens: int | None
    result_json: str | None
    updated_at: int

class ReconciliationJournal:
    STATES = {"reserved", "executed", "reconciled", "failed"}

    def __init__(self, path: str):
        self.path = path
        with self._connect() as db:
            db.execute("""CREATE TABLE IF NOT EXISTS rc188_operations(
                operation_id TEXT PRIMARY KEY,
                state TEXT NOT NULL CHECK(state IN ('reserved','executed','reconciled','failed')),
                reserved_tokens INTEGER NOT NULL CHECK(reserved_tokens >= 0),
                observed_tokens INTEGER,
                result_json TEXT,
                updated_at INTEGER NOT NULL)""")

    def _connect(self):
        db=sqlite3.connect(self.path, timeout=10, isolation_level=None)
        db.execute("PRAGMA journal_mode=WAL")
        db.execute("PRAGMA busy_timeout=10000")
        return db

    def reserve(self, operation_id: str, reserved_tokens: int) -> JournalRecord:
        if not operation_id or reserved_tokens < 0: raise ValueError("invalid reservation")
        with self._connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row=db.execute("SELECT * FROM rc188_operations WHERE operation_id=?",(operation_id,)).fetchone()
            if row:
                if row[2] != reserved_tokens: raise ValueError("operation reservation mismatch")
                db.commit(); return self._record(row)
            now=int(time.time())
            db.execute("INSERT INTO rc188_operations VALUES(?,?,?,?,?,?)",
                       (operation_id,"reserved",reserved_tokens,None,None,now))
            row=db.execute("SELECT * FROM rc188_operations WHERE operation_id=?",(operation_id,)).fetchone()
            db.commit(); return self._record(row)

    def mark_executed(self, operation_id: str, observed_tokens: int, result: Any=None) -> JournalRecord:
        if observed_tokens < 0: raise ValueError("observed tokens must be nonnegative")
        result_json=json.dumps(result, sort_keys=True, separators=(",",":")) if result is not None else None
        with self._connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row=db.execute("SELECT * FROM rc188_operations WHERE operation_id=?",(operation_id,)).fetchone()
            if not row: raise KeyError(operation_id)
            if row[1] in ("executed","reconciled"):
                if row[3] != observed_tokens or row[4] != result_json: raise ValueError("execution outcome conflicts with recorded outcome")
                db.commit(); return self._record(row)
            if row[1] != "reserved": raise ValueError("operation is not in reserved state")
            db.execute("UPDATE rc188_operations SET state='executed', observed_tokens=?, result_json=?, updated_at=? WHERE operation_id=?",
                       (observed_tokens,result_json,int(time.time()),operation_id))
            row=db.execute("SELECT * FROM rc188_operations WHERE operation_id=?",(operation_id,)).fetchone()
            db.commit(); return self._record(row)

    def reconcile(self, operation_id: str) -> JournalRecord:
        with self._connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row=db.execute("SELECT * FROM rc188_operations WHERE operation_id=?",(operation_id,)).fetchone()
            if not row: raise KeyError(operation_id)
            if row[1] == "reconciled": db.commit(); return self._record(row)
            if row[1] != "executed": raise ValueError("only executed operations can reconcile")
            # Reconciliation is a state acknowledgement only; external quota/payment
            # settlement must be separately performed and confirmed.
            db.execute("UPDATE rc188_operations SET state='reconciled', updated_at=? WHERE operation_id=?",
                       (int(time.time()),operation_id))
            row=db.execute("SELECT * FROM rc188_operations WHERE operation_id=?",(operation_id,)).fetchone()
            db.commit(); return self._record(row)

    def fail(self, operation_id: str) -> JournalRecord:
        with self._connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row=db.execute("SELECT * FROM rc188_operations WHERE operation_id=?",(operation_id,)).fetchone()
            if not row: raise KeyError(operation_id)
            if row[1] in ("reconciled","executed"): raise ValueError("cannot mark recorded execution as failed")
            if row[1] == "failed": db.commit(); return self._record(row)
            db.execute("UPDATE rc188_operations SET state='failed', updated_at=? WHERE operation_id=?",
                       (int(time.time()),operation_id))
            row=db.execute("SELECT * FROM rc188_operations WHERE operation_id=?",(operation_id,)).fetchone()
            db.commit(); return self._record(row)

    def get(self, operation_id: str) -> JournalRecord | None:
        with self._connect() as db:
            row=db.execute("SELECT * FROM rc188_operations WHERE operation_id=?",(operation_id,)).fetchone()
            return self._record(row) if row else None

    def pending(self) -> list[JournalRecord]:
        with self._connect() as db:
            rows=db.execute("SELECT * FROM rc188_operations WHERE state IN ('reserved','executed') ORDER BY updated_at").fetchall()
            return [self._record(row) for row in rows]

    @staticmethod
    def _record(row):
        return JournalRecord(row[0],row[1],row[2],row[3],row[4],row[5])
