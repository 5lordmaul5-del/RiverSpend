import os
import sqlite3
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor

from rc181_payload_ledger import PayloadPersistentTaskLedger
from rc181_authenticated_intake import AuthenticatedTaskIntake


class AuthenticatedIntakeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = os.path.join(self.tmp.name, "intake.sqlite")
        self.ledger = PayloadPersistentTaskLedger(self.path, queue_limit=10, lease_seconds=10)
        self.tokens = {"alice": {"subject": "alice"}, "bob": {"subject": "bob"}}
        self.policy_calls = []
        def verify(token):
            if token not in self.tokens:
                raise ValueError("invalid token")
            return self.tokens[token]
        def policy(subject, capability, summary, payload):
            self.policy_calls.append((subject, capability, summary, payload))
            return subject == "alice" and capability == "echo"
        self.intake = AuthenticatedTaskIntake(self.ledger, verify, policy)

    def tearDown(self):
        self.tmp.cleanup()

    def submit(self, token="alice", key="k1", payload=None):
        return self.intake.submit(token, "echo", "summary", payload or {"text":"hello"}, key)

    def test_verified_subject_is_owner_and_audit_is_atomic_with_acceptance(self):
        out = self.submit()
        self.assertEqual(out["status"], "accepted")
        with sqlite3.connect(self.path) as db:
            owner = db.execute("SELECT owner FROM tasks WHERE id=?", (out["task_id"],)).fetchone()[0]
        self.assertEqual(owner, "alice")
        rows = self.ledger.intake_events(out["task_id"])
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["actor"], "alice")
        self.assertEqual(rows[0]["action"], "intake_accepted")
        self.assertIsNotNone(rows[0]["request_key_sha256"])
        self.assertIsNotNone(rows[0]["request_sha256"])

    def test_task_and_acceptance_audit_rollback_together(self):
        original = self.ledger._audit_insert
        def failing(db, task_id, actor, action, key_digest, request_digest):
            original(db, task_id, actor, action, key_digest, request_digest)
            raise RuntimeError("simulated audit failure")
        self.ledger._audit_insert = failing
        out = self.submit(key="atomic")
        self.assertEqual(out["status"], "error")
        self.assertEqual(self.ledger.status()["queued"], 0)
        self.assertEqual(self.ledger.intake_events(), [])

    def test_replay_returns_same_task_and_audits_replay(self):
        first = self.submit()
        replay = self.submit(payload={"text":"hello"})
        self.assertEqual(first["task_id"], replay["task_id"])
        self.assertEqual(replay["status"], "replayed")
        actions = [r["action"] for r in self.ledger.intake_events(first["task_id"])]
        self.assertEqual(actions, ["intake_accepted", "intake_replayed"])

    def test_request_key_conflict_is_rejected_and_audited(self):
        first = self.submit()
        conflict = self.submit(payload={"text":"different"})
        self.assertEqual(first["status"], "accepted")
        self.assertEqual(conflict["status"], "conflict")
        actions = [r["action"] for r in self.ledger.intake_events(first["task_id"])]
        self.assertIn("request_key_conflict", actions)

    def test_policy_denial_never_enqueues_and_is_audited(self):
        out = self.intake.submit("bob", "echo", "summary", {"text":"hello"}, "key")
        self.assertEqual(out["status"], "denied")
        self.assertEqual(self.ledger.status()["queued"], 0)
        events = self.ledger.intake_events()
        self.assertEqual(events[-1]["action"], "policy_denied")
        self.assertEqual(events[-1]["actor"], "bob")

    def test_invalid_token_is_denied_and_audited_without_token_logging(self):
        out = self.intake.submit("invalid", "echo", "summary", {"text":"hello"}, "key")
        self.assertEqual(out["status"], "denied")
        events = self.ledger.intake_events()
        self.assertEqual(events[-1]["action"], "authentication_denied")
        self.assertIsNone(events[-1]["actor"])
        self.assertEqual(self.ledger.status()["queued"], 0)

    def test_payload_is_data_only_before_policy(self):
        class UnsafeDict(dict):
            pass
        out = self.submit(payload=UnsafeDict({"text":"hello"}))
        self.assertEqual(out["status"], "invalid")
        self.assertEqual(len(self.policy_calls), 0)
        self.assertEqual(self.ledger.status()["queued"], 0)

    def test_queue_full_is_audited(self):
        small = PayloadPersistentTaskLedger(self.path, queue_limit=1, lease_seconds=10)
        intake = AuthenticatedTaskIntake(small, lambda token: {"subject":"alice"},
                                         lambda *args: True)
        first = intake.submit("token", "echo", "summary", {"x":1}, "first")
        second = intake.submit("token", "echo", "summary", {"x":2}, "second")
        self.assertEqual(first["status"], "accepted")
        self.assertEqual(second["status"], "queue_full")
        events = small.intake_events()
        self.assertEqual(events[-1]["action"], "queue_full")
        self.assertIsNone(events[-1]["task_id"])

    def test_concurrent_replay_creates_one_task(self):
        def submit_one():
            return self.submit(key="race", payload={"text":"same"})
        with ThreadPoolExecutor(max_workers=6) as pool:
            results = list(pool.map(lambda _: submit_one(), range(6)))
        ids = {r["task_id"] for r in results}
        self.assertEqual(len(ids), 1)
        self.assertEqual(self.ledger.status()["queued"], 1)
        actions = [r["action"] for r in self.ledger.intake_events(next(iter(ids)))]
        self.assertEqual(actions.count("intake_accepted"), 1)
        self.assertEqual(actions.count("intake_replayed"), 5)

    def test_token_and_request_key_bounds_fail_closed(self):
        out = self.intake.submit("x"*8193, "echo", "summary", {"x":1}, "k")
        self.assertEqual(out["status"], "denied")
        out = self.submit(key="x"*129)
        self.assertEqual(out["status"], "invalid")
        self.assertEqual(self.ledger.status()["queued"], 0)


if __name__ == "__main__":
    unittest.main()
