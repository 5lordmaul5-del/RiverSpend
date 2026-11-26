import os
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor

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

    def test_capability_filter(self):
        self.ledger.enqueue("echo", "task", "u", {})
        self.assertIsNone(self.ledger.lease_next("w", ("other",)))

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

    def test_idempotent_same_owner_request_returns_original_task(self):
        payload = {"text": "hello", "n": 1}
        first = self.ledger.enqueue("echo", "task", "user-1", payload, request_key="req-1")
        repeat = self.ledger.enqueue("echo", "task", "user-1", {"n": 1, "text": "hello"}, request_key="req-1")
        self.assertEqual(first, repeat)
        self.assertEqual(self.ledger.status()["queued"], 1)

    def test_duplicate_request_key_is_checked_before_queue_capacity(self):
        first = self.ledger.enqueue("echo", "task", "user-1", {"x": 1}, request_key="req-1")
        self.ledger.enqueue("echo", "other", "user-2", {"x": 2})
        repeat = self.ledger.enqueue("echo", "task", "user-1", {"x": 1}, request_key="req-1")
        self.assertEqual(first, repeat)

    def test_request_key_reuse_with_changed_content_rejected(self):
        first = self.ledger.enqueue("echo", "task", "user-1", {"x": 1}, request_key="req-1")
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo", "task", "user-1", {"x": 2}, request_key="req-1")
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo", "changed", "user-1", {"x": 1}, request_key="req-1")
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("other", "task", "user-1", {"x": 1}, request_key="req-1")
        self.assertEqual(self.ledger.lease_next("worker", ("echo",))["id"], first)

    def test_request_key_is_owner_scoped(self):
        first = self.ledger.enqueue("echo", "task", "user-1", {"x": 1}, request_key="same")
        second = self.ledger.enqueue("echo", "task", "user-1", {"x": 1})
        third = self.ledger.enqueue("echo", "task", "user-2", {"x": 1}, request_key="same")
        self.assertNotEqual(first, second)
        self.assertNotEqual(first, third)

    def test_request_key_validation(self):
        for value in ("", " " , "x" * 129, 1, None):
            if value is None:
                continue
            with self.subTest(value=value), self.assertRaises(PayloadLedgerError):
                self.ledger.enqueue("echo", "task", "user-1", {}, request_key=value)

    def test_concurrent_identical_requests_share_one_task(self):
        def submit():
            return self.ledger.enqueue("echo", "task", "user-1", {"x": 1}, request_key="race-key")
        with ThreadPoolExecutor(max_workers=6) as pool:
            ids = list(pool.map(lambda _: submit(), range(6)))
        self.assertEqual(len(set(ids)), 1)
        self.assertEqual(self.ledger.status()["queued"], 1)


if __name__ == "__main__":
    unittest.main()
