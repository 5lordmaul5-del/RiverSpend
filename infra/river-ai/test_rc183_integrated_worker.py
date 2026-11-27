import os
import sqlite3
import tempfile
import time
import unittest
from concurrent.futures import ThreadPoolExecutor

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

    def test_result_digest_corruption_fails_closed(self):
        task=self.ledger.enqueue("echo","summary","user-1",{"text":"hello"})
        self.assertEqual(self.core.run_once("worker-token")["status"],"completed")
        with sqlite3.connect(self.path) as db:
            db.execute("UPDATE task_results SET result_json=? WHERE task_id=?",('{"tampered":true}',task))
        self.assertIsNone(self.core.get_result(task,"user-1"))

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

    def test_malformed_lease_envelope_recovers_and_audits(self):
        task=self.ledger.enqueue("echo","summary","user-1",{"text":"shape"})
        class Malformed:
            db_path=self.ledger.db_path
            lease_seconds=self.ledger.lease_seconds
            def lease_next(inner,worker,caps):
                lease=self.ledger.lease_next(worker,caps)
                if lease: lease.pop("payload")
                return lease
        core=WorkerCore(Malformed(),self.path,self.verify,self.policy,self.executor)
        out=core.run_once("worker-token")
        self.assertEqual(out["status"],"rejected")
        self.assertEqual(out["recovery"],"retry")
        self.assertEqual(self.ledger.status()["queued"],1)
        event=self.core.events(task)[-1]
        self.assertEqual(event["action"],"retry_scheduled")
        self.assertEqual(event["error_code"],"lease_contract_invalid")
        self.assertEqual(self.executor.keys,[])

    def test_malformed_lease_uses_persisted_attempt_budget(self):
        task=self.ledger.enqueue("echo","summary","user-1",{"text":"shape"})
        with sqlite3.connect(self.path) as db:
            db.execute("UPDATE tasks SET attempts=2 WHERE id=?",(task,))
        class Malformed:
            db_path=self.ledger.db_path
            lease_seconds=self.ledger.lease_seconds
            def lease_next(inner,worker,caps):
                lease=self.ledger.lease_next(worker,caps)
                if lease:
                    lease["attempts"]=1 # envelope lies; DB has attempt 3
                    lease.pop("payload")
                return lease
        core=WorkerCore(Malformed(),self.path,self.verify,self.policy,self.executor,max_attempts=3)
        out=core.run_once("worker-token")
        self.assertEqual(out["status"],"rejected")
        self.assertEqual(out["recovery"],"exhausted")
        self.assertEqual(self.ledger.status()["cancelled"],1)
        self.assertEqual(self.executor.keys,[])

    def test_mismatched_database_path_is_rejected(self):
        other=os.path.join(self.tmp.name,"other.sqlite")
        with self.assertRaises(ValueError):
            WorkerCore(self.ledger,other,self.verify,self.policy,self.executor)
        self.assertFalse(os.path.exists(other))

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

    def test_request_key_replay_through_completed_worker(self):
        first=self.ledger.enqueue("echo","summary","user-1",{"text":"same","n":1},request_key="req-1")
        repeat=self.ledger.enqueue("echo","summary","user-1",{"n":1,"text":"same"},request_key="req-1")
        self.assertEqual(first,repeat)
        out=self.core.run_once("worker-token")
        self.assertEqual(out["status"],"completed")
        self.assertEqual(self.ledger.enqueue("echo","summary","user-1",{"text":"same","n":1},request_key="req-1"),first)
        self.assertEqual(self.ledger.status()["completed"],1)
        self.assertEqual(self.core.get_result(first,"user-1")["result"]["echo"],"same")

    def test_request_key_changed_content_rejected_and_owner_scoped(self):
        first=self.ledger.enqueue("echo","summary","user-1",{"x":1},request_key="same")
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("echo","summary","user-1",{"x":2},request_key="same")
        with self.assertRaises(PayloadLedgerError):
            self.ledger.enqueue("other","summary","user-1",{"x":1},request_key="same")
        second=self.ledger.enqueue("echo","summary","user-2",{"x":1},request_key="same")
        self.assertNotEqual(first,second)

    def test_request_key_replay_bypasses_queue_capacity(self):
        path=os.path.join(self.tmp.name,"limited.sqlite")
        limited=PayloadPersistentTaskLedger(path,queue_limit=1,lease_seconds=10)
        first=limited.enqueue("echo","summary","user-1",{"x":1},request_key="key")
        repeated=limited.enqueue("echo","summary","user-1",{"x":1},request_key="key")
        self.assertEqual(first,repeated)
        self.assertEqual(limited.status()["queued"],1)

    def test_concurrent_request_key_replays_create_one_task(self):
        def submit():
            return self.ledger.enqueue("echo","summary","user-1",{"x":1},request_key="race")
        with ThreadPoolExecutor(max_workers=6) as pool:
            ids=list(pool.map(lambda _:submit(),range(6)))
        self.assertEqual(len(set(ids)),1)
        self.assertEqual(self.ledger.status()["queued"],1)

    def test_request_key_validation(self):
        for key in ("", " ", "x"*129, 1):
            with self.subTest(key=key), self.assertRaises(PayloadLedgerError):
                self.ledger.enqueue("echo","summary","user-1",{},request_key=key)

    def test_stale_attempt_cannot_complete_after_same_worker_releases_and_releases_again(self):
        task = self.ledger.enqueue("echo", "summary", "user-1", {"text": "fence"})
        first = self.ledger.lease_next("worker-a", ("echo",))
        self.assertEqual(first["attempts"], 1)
        with sqlite3.connect(self.path) as db:
            db.execute("UPDATE tasks SET leased=? WHERE id=?", (time.time() - self.ledger.lease_seconds - 1, task))
        second = self.ledger.lease_next("worker-a", ("echo",))
        self.assertEqual(second["attempts"], 2)
        result_json = '{"ok":true}'
        result_digest = __import__("hashlib").sha256(result_json.encode()).hexdigest()
        self.assertFalse(self.core._persist_success(task, "worker-a", first["attempts"], first["leased_at"], "payload-digest", result_json, result_digest))
        with sqlite3.connect(self.path) as db:
            state, attempts = db.execute("SELECT state,attempts FROM tasks WHERE id=?", (task,)).fetchone()
        self.assertEqual((state, attempts), ("leased", 2))
        self.assertTrue(self.core._persist_success(task, "worker-a", second["attempts"], second["leased_at"], "payload-digest", result_json, result_digest))
        self.assertEqual(self.core.get_result(task, "user-1")["result"], {"ok": True})

    def test_stale_attempt_cannot_fail_newer_lease(self):
        task = self.ledger.enqueue("echo", "summary", "user-1", {"text": "fence-failure"})
        first = self.ledger.lease_next("worker-a", ("echo",))
        self.assertEqual(first["attempts"], 1)
        with sqlite3.connect(self.path) as db:
            db.execute("UPDATE tasks SET leased=? WHERE id=?", (time.time() - self.ledger.lease_seconds - 1, task))
        second = self.ledger.lease_next("worker-a", ("echo",))
        self.assertEqual(second["attempts"], 2)
        self.assertEqual(self.core._persist_failure(task, "worker-a", first["attempts"], first["leased_at"], "payload-digest"), "lease_lost")
        with sqlite3.connect(self.path) as db:
            state, attempts = db.execute("SELECT state,attempts FROM tasks WHERE id=?", (task,)).fetchone()
        self.assertEqual((state, attempts), ("leased", 2))
        self.assertEqual(self.core._persist_failure(task, "worker-a", second["attempts"], second["leased_at"], "payload-digest"), "retry")
        self.assertEqual(self.ledger.status()["queued"], 1)

if __name__=="__main__": unittest.main()
