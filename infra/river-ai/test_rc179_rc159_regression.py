"""RC-179 executable regression tests for the RC-159 SQLite ledger.

These tests import the RC-159 prototype directly. They are isolated, deterministic
except for the deliberately short lease-expiry wait, and do not execute payloads.
"""
import os
import tempfile
import time
import unittest

from rc159_persistent_ledger import PersistentTaskLedger


class RC179LedgerRegressionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.tmp.name, "ledger.sqlite")
        self.ledger = PersistentTaskLedger(self.db_path, queue_limit=2, lease_seconds=1)

    def tearDown(self):
        self.tmp.cleanup()

    def test_queue_capacity_is_bounded(self):
        self.ledger.enqueue("echo", "one")
        self.ledger.enqueue("echo", "two")
        with self.assertRaises(OverflowError):
            self.ledger.enqueue("echo", "three")

    def test_capability_filter_does_not_lease_wrong_task(self):
        self.ledger.enqueue("echo", "payload")
        self.assertIsNone(self.ledger.lease_next("worker", ("other",)))
        self.assertEqual(self.ledger.status()["queued"], 1)

    def test_completion_requires_current_lease_owner(self):
        task_id = self.ledger.enqueue("echo", "payload")
        lease = self.ledger.lease_next("worker-A", ("echo",))
        self.assertEqual(lease["id"], task_id)
        self.assertFalse(self.ledger.complete(task_id, "worker-B"))
        self.assertTrue(self.ledger.complete(task_id, "worker-A"))
        self.assertEqual(self.ledger.status()["completed"], 1)

    def test_cancel_queued_task(self):
        task_id = self.ledger.enqueue("echo", "payload")
        self.assertTrue(self.ledger.cancel(task_id))
        self.assertFalse(self.ledger.cancel(task_id))
        self.assertEqual(self.ledger.status()["cancelled"], 1)

    def test_cancel_leased_task(self):
        task_id = self.ledger.enqueue("echo", "payload")
        self.ledger.lease_next("worker", ("echo",))
        self.assertTrue(self.ledger.cancel(task_id))
        self.assertFalse(self.ledger.complete(task_id, "worker"))
        self.assertEqual(self.ledger.status()["cancelled"], 1)

    def test_lease_expiry_requeues_and_increments_attempt(self):
        task_id = self.ledger.enqueue("echo", "payload")
        first = self.ledger.lease_next("worker-A", ("echo",))
        self.assertEqual(first["attempts"], 1)
        time.sleep(1.05)
        second = self.ledger.lease_next("worker-B", ("echo",))
        self.assertEqual(second["id"], task_id)
        self.assertEqual(second["attempts"], 2)

    def test_restart_preserves_task_metadata(self):
        task_id = self.ledger.enqueue("echo", "durable payload")
        reopened = PersistentTaskLedger(self.db_path, queue_limit=2, lease_seconds=1)
        lease = reopened.lease_next("worker", ("echo",))
        self.assertEqual(lease["id"], task_id)
        self.assertEqual(lease["summary"], "durable payload")

    def test_invalid_inputs_are_rejected(self):
        with self.assertRaises(ValueError):
            self.ledger.enqueue("", "payload")
        with self.assertRaises(ValueError):
            self.ledger.enqueue("echo", "x" * 501)
        with self.assertRaises(ValueError):
            self.ledger.lease_next("", ("echo",))

    def test_empty_capability_set_returns_none(self):
        self.ledger.enqueue("echo", "payload")
        self.assertIsNone(self.ledger.lease_next("worker", ()))
        self.assertEqual(self.ledger.status()["queued"], 1)


if __name__ == "__main__":
    unittest.main()
