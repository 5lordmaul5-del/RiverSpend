"""RC-184: lightweight SQLite usage ledger for RiverSSAI SaaS scaffolding.

Trusted server-side code must provide authenticated user IDs and enforce policy.
This module is not a billing ledger and does not estimate provider costs.
"""
import sqlite3
from pathlib import Path
from contextlib import contextmanager

SCHEMA = """
CREATE TABLE IF NOT EXISTS usage_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  plan_key TEXT NOT NULL,
  period_key TEXT NOT NULL,
  request_id TEXT NOT NULL UNIQUE,
  tokens INTEGER NOT NULL CHECK(tokens >= 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS usage_events_user_period
ON usage_events(user_id, period_key);
"""

class UsageLedgerError(ValueError):
    pass

class UsageLedger:
    def __init__(self, database_path):
        self.database_path = str(database_path)
        with self._connect() as db:
            db.executescript(SCHEMA)

    @contextmanager
    def _connect(self):
        db = sqlite3.connect(self.database_path, timeout=10)
        db.execute("PRAGMA foreign_keys=ON")
        db.execute("PRAGMA busy_timeout=10000")
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def record(self, user_id, plan_key, period_key, request_id, tokens):
        if not all(isinstance(v, str) and v.strip() for v in (user_id, plan_key, period_key, request_id)):
            raise UsageLedgerError("identity, plan, period, and request ID must be non-empty strings")
        if isinstance(tokens, bool) or not isinstance(tokens, int) or tokens < 0:
            raise UsageLedgerError("tokens must be a non-negative integer")
        try:
            with self._connect() as db:
                db.execute("INSERT INTO usage_events(user_id,plan_key,period_key,request_id,tokens) VALUES(?,?,?,?,?)",
                           (user_id, plan_key, period_key, request_id, tokens))
        except sqlite3.IntegrityError as e:
            if "UNIQUE constraint failed" in str(e):
                raise UsageLedgerError("duplicate request_id") from None
            raise

    def total(self, user_id, period_key):
        if not all(isinstance(v, str) and v.strip() for v in (user_id, period_key)):
            raise UsageLedgerError("user_id and period_key must be non-empty strings")
        with self._connect() as db:
            row = db.execute("SELECT COALESCE(SUM(tokens),0) FROM usage_events WHERE user_id=? AND period_key=?",
                             (user_id, period_key)).fetchone()
            return int(row[0])

    def event_count(self, user_id, period_key):
        with self._connect() as db:
            row = db.execute("SELECT COUNT(*) FROM usage_events WHERE user_id=? AND period_key=?",
                             (user_id, period_key)).fetchone()
            return int(row[0])
