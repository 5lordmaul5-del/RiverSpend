import os
import sqlite3
import tempfile
import time
import unittest
from concurrent.futures import ThreadPoolExecutor

from rc159_persistent_ledger import PersistentTaskLedger
from rc181_payload_ledger import PayloadPersistentTaskLedger, PayloadLedgerError
from rc183_integrated_worker import WorkerCore


class Policy:
    def __init__(self): self.authorized=[]; self.finished=[]; self.refunded=[]
    def authorize(self, kind, owner, **binding):
        self.authorized.append((kind, owner, binding))
        return {"approval":"test-only"}
    def finish(self, authorization, success):
        self.finished.append((authorization, success))
        return True
    def refund(self, authorization): self.refunded.append(authorization)


class Echo:
    def __init__(self): self.keys=[]
    def execute(self, kind, payload, idempotency_key):
        self.keys.append(idempotency_key)
        return {"echo":payload["text"],"key":idempotency_key}


class WorkerCoreIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.path=os.path.join(self.tmp.name,"ledger.sqlite")
        self.ledger=PayloadPersistentTaskLedger(self.path,queue_limit=10,lease_seconds=10)
        self.policy=Policy()
        self.executor=Echo()
        def verify(token):
            if token!="worker-token": raise ValueError("invalid token")
            return {"subject":"worker-a","capabilities":["echo"]}
        self.verify=verify
        self.core=WorkerCore(self.ledger,self.path,verify,self.policy,self.executor,max_attempts=3)
    def tearDown(self): self.tmp.cleanup()

    def test_intake_execute_atomic_completion_result_and_audit(self):
        task=self.ledger.enqueue("echo","summary","user-1",{"text":"hello"})
        out=self.core.run_once("worker-token")
        self.assertEqual(out["status"],"completed")
        stored=self.core.get_result(task,"user-1")
        self.assertIsNone(self.core.get_result(task,"other-user"))
        self.assertEqual(stored["result"]["echo"],"hello")
        self.assertEqual(stored["result"]["key"],task)
        self.assertEqual(self.ledger.status()["completed"],1)
        self.assertEqual([e["action"] for e in self.core.events(task)],["leased","completed"])
        self.assertEqual(self.policy.finished[0][1],True)

    def test_invalid_identity_does_not_lease_task(self):
        task=self.ledger.enqueue("echo","summary","user-1",{"text":"hello"})
        out=self.core.run_once("bad-token")
        self.assertEqual(out["status"],"denied")
        self.assertEqual(self.ledger.status()["queued"],1)
        self.assertIsNone(self.core.get_result(task,"user-1"))

    def test_capability_mismatch_leaves_task_queued(self):
        self.ledger.enqueue("echo","summary","user-1",{"text":"hello"})
        def limited(token): return {"subject":"worker-b","capabilities":["other"]}
        core=WorkerCore(self.ledger,self.path,limited,self.policy,self.executor)
        self.assertEqual(core.run_once("token")["status"],"idle")
        self.assertEqual(self.ledger.status()["queued"],1)

    def test_retry_reuses_task_idempotency_key_and_persists_result(self):
        task=self.ledger.enqueue("echo","summary","user-1",{"text":"retry"})
        class FailOnce:
            def __init__(self): self.keys=[]
            def execute(self,kind,payload,idempotency_key):
                self.keys.append(idempotency_key)
                if len(self.keys)==1: raise RuntimeError("transient")
                return {"ok":payload["text"]}
        executor=FailOnce()
        core=WorkerCore(self.ledger,self.path,self.verify,self.policy,executor,max_attempts=3)
        self.assertEqual(core.run_once("worker-token")["status"],"retry")
        self.assertEqual(self.ledger.status()["queued"],1)
        self.assertEqual(core.run_once("worker-token")["status"],"completed")
        self.assertEqual(executor.keys,[task,task])
        self.assertEqual(core.get_result(task,"user-1")["result"],{"ok":"retry"})
        actions=[e["action"] for e in core.events(task)]
        self.assertIn("retry_scheduled",actions)
        self.assertIn("completed",actions)

    def test_retry_exhaustion_cancels_and_records_event(self):
        task=self.ledger.enqueue("echo","summary","user-1",{"text":"fail"})
        class Broken:
            def execute(self,kind,payload,idempotency_key): raise RuntimeError()
        core=WorkerCore(self.ledger,self.path,self.verify,self.policy,Broken(),max_attempts=2)
        self.assertEqual(core.run_once("worker-token")["status"],"retry")
        self.assertEqual(core.run_once("worker-token")["status"],"exhausted")
        self.assertEqual(self.ledger.status()["cancelled"],1)
        self.assertIn("attempts_exhausted",[e["action"] for e in core.events(task)])

    def test_expired_lease_rejects_result(self):
        path=os.path.join(self.tmp.name,"short.sqlite")
        ledger=PayloadPersistentTaskLedger(path,queue_limit=2,lease_seconds=1)
        ledger.enqueue("echo","summary","user-1",{"text":"slow"})
        class Slow:
            def execute(self,kind,payload,idempotency_key):
                time.sleep(1.15)
                return {"ok":True}
        core=WorkerCore(ledger,path,self.verify,Policy(),Slow())
        self.assertEqual(core.run_once("worker-token")["status"],"lease_lost")
        self.assertEqual(ledger.status()["completed"],0)

    def test_malformed_payload_is_requeued_without_execution(self):
        task=self.ledger.enqueue("echo","summary","user-1",{"text":"bad"})
        with sqlite3.connect(self.path) as db:
            db.execute("UPDATE tasks SET payload_json=? WHERE id=?",('{"__proto__":1}',task))
        out=self.core.run_once("worker-token")
        self.assertEqual(out["status"],"retry")
        self.assertEqual(self.ledger.status()["queued"],1)
        self.assertIn("retry_scheduled",[e["action"] for e in self.core.events(task)])

    def test_policy_settlement_failure_retries_and_refunds(self):
        task=self.ledger.enqueue("echo","summary","user-1",{"text":"settle"})
        class RefusingPolicy(Policy):
            def finish(self,authorization,success):
                self.finished.append((authorization,success))
                return False
        policy=RefusingPolicy()
        core=WorkerCore(self.ledger,self.path,self.verify,policy,self.executor)
        self.assertEqual(core.run_once("worker-token")["status"],"retry")
        self.assertTrue(policy.refunded)
        self.assertEqual(self.ledger.status()["queued"],1)

    def test_attempts_from_expired_leases_cannot_exceed_limit(self):
        task=self.ledger.enqueue("echo","summary","user-1",{"text":"crash"})
        with sqlite3.connect(self.path) as db:
            db.execute("UPDATE tasks SET attempts=3 WHERE id=?",(task,))
        out=self.core.run_once("worker-token")
        self.assertEqual(out["status"],"exhausted")
        self.assertEqual(self.ledger.status()["cancelled"],1)
        self.assertEqual(self.executor.keys,[])

    def test_oversized_identity_token_is_rejected_before_leasing(self):
        task=self.ledger.enqueue("echo","summary","user-1",{"text":"hello"})
        out=self.core.run_once("x"*8193)
        self.assertEqual(out["status"],"denied")
        self.assertEqual(self.ledger.status()["queued"],1)
        self.assertIsNone(self.core.get_result(task,"user-1"))

    def test_legacy_result_table_migrates_owner_column(self):
        legacy_path=os.path.join(self.tmp.name,"legacy.sqlite")
        with sqlite3.connect(legacy_path) as db:
            db.execute("""CREATE TABLE task_results (
                task_id TEXT PRIMARY KEY, result_json TEXT NOT NULL,
                result_sha256 TEXT NOT NULL, worker_subject TEXT NOT NULL,
                idempotency_key TEXT NOT NULL UNIQUE, completed_at REAL NOT NULL
            )""")
        ledger=PayloadPersistentTaskLedger(legacy_path,queue_limit=2,lease_seconds=10)
        WorkerCore(ledger,legacy_path,self.verify,Policy(),self.executor)
        with sqlite3.connect(legacy_path) as db:
            columns={row[1] for row in db.execute("PRAGMA table_info(task_results)")}
        self.assertIn("owner",columns)

    def test_intake_request_key_is_idempotent_and_canonical(self):
        first=self.ledger.enqueue("echo","summary","user-1",{"text":"hello","n":1},request_key="req-1")
        second=self.ledger.enqueue("echo","summary","user-1",{"n":1,"text":"hello"},request_key="req-1")
        self.assertEqual(first,second)
        self.assertEqual(self.ledger.status()["queued"],1)

    def test_duplicate_request_key_checked_before_queue_capacity(self):
        first=self.ledger.enqueue("echo","summary","user-1",{"x":1},request_key="req-1")
        repeat=self.ledger.enqueue("echo","summary","user-1",{"x":1},request_key="req-1")
        self.assertEqual(first,repeat)
        self.assertEqual(self.ledger.status()["queued"],1)

    def test_request_key_reuse_with_changed_content_rejected(self):
        first=self.ledger.enqueue("echo","summary","user-1",{"x":1},request_key="req-1")
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo","summary","user-1",{"x":2},request_key="req-1")
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo","summary","user-1",{"x":1},request_key="req-1",summary_limit=1)
        self.assertEqual(self.ledger.lease_next("worker",("echo",))["id"],first)

    def test_request_key_owner_scope(self):
        first=self.ledger.enqueue("echo","summary","user-1",{"x":1},request_key="same")
        second=self.ledger.enqueue("echo","summary","user-2",{"x":1},request_key="same")
        self.assertNotEqual(first,second)

    def test_request_key_validation(self):
        for value in ("", " ", "x"*129, 1):
            with self.subTest(value=value), self.assertRaises(PayloadLedgerError):
                self.ledger.enqueue("echo","summary","user-1",{},request_key=value)

    def test_concurrent_duplicate_intake_returns_one_task(self):
        def submit():
            return self.ledger.enqueue("echo","summary","user-1",{"text":"race"},request_key="race-key")
        with ThreadPoolExecutor(max_workers=6) as pool:
            ids=list(pool.map(lambda _:submit(),range(6)))
        self.assertEqual(len(set(ids)),1)
        self.assertEqual(self.ledger.status()["queued"],1)

    def test_migrates_rc159_task_schema_for_request_keys(self):
        legacy_path=os.path.join(self.tmp.name,"legacy-tasks.sqlite")
        base=PersistentTaskLedger(legacy_path,queue_limit=2,lease_seconds=10)
        old_task=base.enqueue("echo","old")
        migrated=PayloadPersistentTaskLedger(legacy_path,queue_limit=2,lease_seconds=10)
        new_task=migrated.enqueue("echo","new","user-1",{"text":"new"},request_key="migrated-key")
        self.assertEqual(migrated.lease_next("worker",("echo",))["id"],old_task)
        with sqlite3.connect(legacy_path) as db:
            cols={row[1] for row in db.execute("PRAGMA table_info(tasks)")}
        self.assertIn("request_key",cols)
        self.assertIn("request_sha256",cols)
        self.assertNotEqual(old_task,new_task)

if __name__=="__main__": unittest.main()
