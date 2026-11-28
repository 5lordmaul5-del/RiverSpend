import os
import sqlite3
import tempfile
import time
import unittest

from rc159_persistent_ledger import PersistentTaskLedger
from rc181_payload_ledger import PayloadPersistentTaskLedger, PayloadLedgerError


class PayloadLedgerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = os.path.join(self.tmp.name, "db.sqlite")
        self.ledger = PayloadPersistentTaskLedger(self.path, 2, 5)

    def tearDown(self):
        self.tmp.cleanup()

    def test_payload_owner_roundtrip(self):
        tid = self.ledger.enqueue("echo", "task", "user-1", {"text": "hi"})
        lease = self.ledger.lease_next("worker-a", ("echo",))
        self.assertEqual(lease["id"], tid)
        self.assertEqual(lease["owner"], "user-1")
        self.assertEqual(lease["payload"], {"text": "hi"})

    def test_expired_lease_reclaim_is_audited_and_cooldown_scheduled(self):
        task = self.ledger.enqueue("echo", "task", "user-1", {"text": "recover"})
        first = self.ledger.lease_next("worker-old", ("echo",))
        with sqlite3.connect(self.path) as db:
            db.execute(
                "UPDATE tasks SET leased=? WHERE id=?",
                (time.time() - self.ledger.lease_seconds - 1, task),
            )
        # Expiry is audited and requeued, but the same polling call cannot
        # immediately reclaim it: the cooldown is persisted in the task row.
        self.assertIsNone(self.ledger.lease_next("worker-new", ("echo",)))
        with sqlite3.connect(self.path) as db:
            row = db.execute(
                "SELECT task_id,attempt,worker_subject,action,error_code "
                "FROM task_events WHERE task_id=? ORDER BY event_id LIMIT 1",
                (task,),
            ).fetchone()
            retry_after = db.execute("SELECT retry_after FROM tasks WHERE id=?", (task,)).fetchone()[0]
        self.assertEqual(
            row, (task, first["attempts"], "worker-old", "lease_expired_requeued", "lease_expired")
        )
        self.assertGreater(retry_after - time.time(), 0)
        self.assertLessEqual(retry_after - time.time(), 1.5)

        with sqlite3.connect(self.path) as db:
            db.execute("UPDATE tasks SET retry_after=? WHERE id=?", (time.time()-1, task))
        second = self.ledger.lease_next("worker-new", ("echo",))
        self.assertEqual(second["id"], task)
        self.assertEqual(second["attempts"], first["attempts"] + 1)

        with sqlite3.connect(self.path) as db:
            db.execute(
                "UPDATE tasks SET leased=? WHERE id=?",
                (time.time() - self.ledger.lease_seconds - 1, task),
            )
        self.assertIsNone(self.ledger.lease_next("worker-third", ("echo",)))
        with sqlite3.connect(self.path) as db:
            retry_after = db.execute("SELECT retry_after FROM tasks WHERE id=?", (task,)).fetchone()[0]
            events = db.execute(
                "SELECT attempt,worker_subject,action,error_code FROM task_events WHERE task_id=? ORDER BY event_id",
                (task,),
            ).fetchall()
        self.assertGreater(retry_after - time.time(), 0)
        self.assertLessEqual(retry_after - time.time(), 2.5)
        self.assertEqual(events, [
            (first["attempts"], "worker-old", "lease_expired_requeued", "lease_expired"),
            (second["attempts"], "worker-new", "lease_expired_requeued", "lease_expired"),
        ])
        with sqlite3.connect(self.path) as db:
            db.execute("UPDATE tasks SET retry_after=? WHERE id=?", (time.time()-1, task))
        third = self.ledger.lease_next("worker-third", ("echo",))
        self.assertEqual(third["id"], task)
        self.assertEqual(third["attempts"], second["attempts"] + 1)

    def test_capability_filter(self):
        self.ledger.enqueue("echo", "task", "u", {})
        self.assertIsNone(self.ledger.lease_next("w", ("other",)))

    def test_retry_after_hides_queued_task_until_due(self):
        task = self.ledger.enqueue("echo", "task", "u", {})
        with sqlite3.connect(self.path) as db:
            db.execute("UPDATE tasks SET retry_after=? WHERE id=?", (time.time() + 30, task))
        self.assertIsNone(self.ledger.lease_next("w", ("echo",)))
        with sqlite3.connect(self.path) as db:
            db.execute("UPDATE tasks SET retry_after=? WHERE id=?", (time.time() - 1, task))
        lease = self.ledger.lease_next("w", ("echo",))
        self.assertEqual(lease["id"], task)
        with sqlite3.connect(self.path) as db:
            self.assertIsNone(db.execute("SELECT retry_after FROM tasks WHERE id=?", (task,)).fetchone()[0])

    def test_invalid_owner_and_capability(self):
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo", "task", "", {})
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("", "task", "u", {})

    def test_payload_bound(self):
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo", "task", "u", {"s": "x" * 17000})

    def test_non_json_payload(self):
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo", "task", "u", {"x": object()})

    def test_persistence(self):
        tid = self.ledger.enqueue("echo", "task", "u", {"x": 1})
        ledger2 = PayloadPersistentTaskLedger(self.path, 2, 5)
        self.assertEqual(ledger2.lease_next("w", ("echo",))["id"], tid)

    def test_queue_limit(self):
        self.ledger.enqueue("echo", "1", "u", {})
        self.ledger.enqueue("echo", "2", "u", {})
        with self.assertRaises(OverflowError):
            self.ledger.enqueue("echo", "3", "u", {})

    def test_reject_nonfinite_numbers(self):
        for value in (float("nan"), float("inf"), float("-inf")):
            with self.subTest(value=value), self.assertRaises(PayloadLedgerError):
                self.ledger.enqueue("echo", "task", "u", {"n": value})

    def test_reject_nonstring_keys_and_unsupported_types(self):
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo", "task", "u", {1: "bad"})
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo", "task", "u", {"nested": (1, 2)})

    def test_reject_cycle_and_depth(self):
        cyclic = {}
        cyclic["self"] = cyclic
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo", "task", "u", cyclic)
        nested = {}
        current = nested
        for _ in range(34):
            current["next"] = {}
            current = current["next"]
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo", "task", "u", nested)

    def test_reject_node_limit_and_reserved_keys(self):
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo", "task", "u", {"items": list(range(2100))})
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo", "task", "u", {"constructor": "bad"})

    def test_reject_payload_subclasses(self):
        class DictSubclass(dict):
            pass
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo", "task", "u", DictSubclass({"x": 1}))

    def test_migrates_existing_rc159_database(self):
        base = PersistentTaskLedger(self.path, 2, 5)
        tid = base.enqueue("echo", "task")
        migrated = PayloadPersistentTaskLedger(self.path, 2, 5)
        lease = migrated.lease_next("worker", ("echo",))
        self.assertEqual(lease["id"], tid)
        self.assertIsNone(lease["owner"])
        self.assertIsNone(lease["payload"])
        with sqlite3.connect(self.path) as db:
            self.assertIn("retry_after", {row[1] for row in db.execute("PRAGMA table_info(tasks)")})


if __name__ == "__main__":
    unittest.main()
