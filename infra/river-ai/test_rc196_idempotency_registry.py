import os
import sqlite3
import tempfile
import threading
import unittest

from rc196_idempotency_registry import IdempotencyRegistry


class Tests(unittest.TestCase):
    def test_first_and_duplicate_are_owner_scoped(self):
        r = IdempotencyRegistry()
        self.assertEqual(r.begin("alice", "k", "p")["status"], "accepted")
        self.assertEqual(r.begin("alice", "k", "p")["status"], "duplicate")
        self.assertEqual(r.begin("bob", "k", "p")["status"], "accepted")
        r.close()

    def test_payload_conflict_is_owner_scoped(self):
        r = IdempotencyRegistry()
        r.begin("alice", "k", "one")
        self.assertEqual(r.begin("alice", "k", "two")["status"], "conflict")
        self.assertEqual(r.begin("bob", "k", "two")["status"], "accepted")
        r.close()

    def test_result_cannot_be_replayed_across_owners(self):
        r = IdempotencyRegistry()
        r.begin("alice", "k", "p")
        self.assertTrue(r.complete("alice", "k", "secret-result"))
        self.assertEqual(r.begin("alice", "k", "p")["result"], "secret-result")
        self.assertEqual(r.begin("bob", "k", "p")["status"], "accepted")
        self.assertIsNone(r.get("bob", "k")[6])
        r.close()

    def test_fail_state_and_owner_scope(self):
        r = IdempotencyRegistry()
        r.begin("alice", "k", "p")
        self.assertTrue(r.fail("alice", "k", "oops"))
        self.assertEqual(r.get("alice", "k")[3], "failed")
        self.assertFalse(r.complete("bob", "k", "done"))
        r.close()

    def test_only_processing_can_complete(self):
        r = IdempotencyRegistry()
        r.begin("alice", "k", "p")
        r.complete("alice", "k", "ok")
        self.assertFalse(r.complete("alice", "k", "again"))
        r.close()

    def test_invalid_and_bounded_inputs(self):
        r = IdempotencyRegistry()
        for args in (("", "k", "p"), ("alice", "", "p"), ("alice", "k", object()), ("alice", "k", "x" * 65537)):
            with self.subTest(args=args), self.assertRaises(ValueError):
                r.begin(*args)
        with self.assertRaises(ValueError):
            r.complete("alice", "k", "x" * 8193)
        r.close()

    def test_migrates_legacy_schema_without_discarding_rows(self):
        with tempfile.TemporaryDirectory() as td:
            db_path = os.path.join(td, "legacy.sqlite")
            db = sqlite3.connect(db_path)
            db.execute("""CREATE TABLE idempotency(
                key TEXT PRIMARY KEY,payload_hash TEXT NOT NULL,state TEXT NOT NULL,
                created REAL NOT NULL,updated REAL NOT NULL,result TEXT,error TEXT)""")
            db.execute("INSERT INTO idempotency VALUES(?,?,?,?,?,?,?)", ("k", "hash", "completed", 1, 2, "saved", None))
            db.commit()
            db.close()
            r = IdempotencyRegistry(db_path)
            db = sqlite3.connect(db_path)
            self.assertEqual(db.execute("SELECT result FROM idempotency WHERE owner=?", ("__legacy_migration__",)).fetchone()[0], "saved")
            db.close()
            with self.assertRaises(ValueError):
                r.get("__legacy_migration__", "k")
            self.assertEqual(r.begin("alice", "k", "new")["status"], "accepted")
            r.close()

    def test_concurrent_duplicate_requests_are_serialized(self):
        with tempfile.TemporaryDirectory() as td:
            db_path = os.path.join(td, "concurrent.sqlite")
            barrier = threading.Barrier(6)
            results = []
            errors = []
            def run():
                reg = IdempotencyRegistry(db_path)
                try:
                    barrier.wait(timeout=3)
                    results.append(reg.begin("alice", "same-key", "same-payload")["status"])
                except Exception as exc:
                    errors.append(exc)
                finally:
                    reg.close()
            threads = [threading.Thread(target=run) for _ in range(6)]
            for t in threads: t.start()
            for t in threads: t.join(timeout=5)
            self.assertFalse(errors, errors)
            self.assertEqual(results.count("accepted"), 1)
            self.assertEqual(results.count("duplicate"), 5)


if __name__ == "__main__":
    unittest.main()
