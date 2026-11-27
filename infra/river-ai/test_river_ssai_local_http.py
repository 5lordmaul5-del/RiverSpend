import json
import os
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from rc181_payload_ledger import PayloadPersistentTaskLedger
from rc181_authenticated_intake import AuthenticatedTaskIntake
from rc183_integrated_worker import WorkerCore
from river_ssai_local_service import create_server


class Policy:
    def authorize(self, capability, owner, **binding):
        return {"approval": "test-only"}
    def finish(self, authorization, success):
        return True
    def refund(self, authorization):
        return None


class EchoExecutor:
    def execute(self, capability, payload, idempotency_key):
        return {"echo": payload["text"], "key": idempotency_key}


class LocalHTTPIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = os.path.join(self.tmp.name, "core.sqlite")
        self.ledger = PayloadPersistentTaskLedger(self.path, queue_limit=10, lease_seconds=10)
        def user_verify(token):
            if token not in ("alice-token", "bob-token"):
                raise ValueError("invalid user")
            return {"subject": token.split("-")[0]}
        def intake_policy(subject, capability, summary, payload):
            return subject == "alice" and capability == "echo"
        self.intake = AuthenticatedTaskIntake(self.ledger, user_verify, intake_policy)
        def worker_verify(token):
            if token != "worker-token":
                raise ValueError("invalid worker")
            return {"subject": "worker-a", "capabilities": ["echo"]}
        self.worker = WorkerCore(self.ledger, self.path, worker_verify, Policy(), EchoExecutor())
        self.server = create_server(self.intake, self.worker, user_verify, host="127.0.0.1", port=0)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.url = "http://127.0.0.1:%s" % self.server.server_address[1]

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.tmp.cleanup()

    def request(self, path, method="GET", token=None, body=None):
        data = None if body is None else json.dumps(body).encode("utf-8")
        headers = {}
        if token is not None:
            headers["Authorization"] = "Bearer " + token
        if data is not None:
            headers["Content-Type"] = "application/json"
        req = Request(self.url + path, data=data, headers=headers, method=method)
        try:
            with urlopen(req, timeout=3) as response:
                return response.status, json.loads(response.read().decode("utf-8"))
        except HTTPError as err:
            return err.code, json.loads(err.read().decode("utf-8"))

    def test_intake_worker_result_and_owner_scope_end_to_end(self):
        body = {"capability":"echo","summary":"hello","payload":{"text":"hello"},"request_key":"request-1"}
        status, intake = self.request("/v1/tasks", "POST", "alice-token", body)
        self.assertEqual(status, 201)
        task_id = intake["task_id"]
        status, run = self.request("/v1/worker/run", "POST", "worker-token")
        self.assertEqual(status, 200)
        self.assertEqual(run["status"], "completed")
        status, result = self.request("/v1/tasks/%s/result" % task_id, token="alice-token")
        self.assertEqual(status, 200)
        self.assertEqual(result["result"]["echo"], "hello")
        self.assertEqual(result["result"]["key"], task_id)
        status, _ = self.request("/v1/tasks/%s/result" % task_id, token="bob-token")
        self.assertEqual(status, 404)

    def test_replay_after_completion_returns_same_task_and_idle_worker(self):
        body = {"capability":"echo","summary":"hello","payload":{"text":"hello"},"request_key":"request-2"}
        first_status, first = self.request("/v1/tasks", "POST", "alice-token", body)
        self.assertEqual(first_status, 201)
        self.request("/v1/worker/run", "POST", "worker-token")
        replay_status, replay = self.request("/v1/tasks", "POST", "alice-token", body)
        self.assertEqual(replay_status, 200)
        self.assertEqual(replay["status"], "replayed")
        self.assertEqual(replay["task_id"], first["task_id"])
        _, run = self.request("/v1/worker/run", "POST", "worker-token")
        self.assertEqual(run["status"], "idle")

    def test_auth_and_request_shape_fail_closed(self):
        body = {"capability":"echo","summary":"hello","payload":{"text":"hello"},"request_key":"request-3"}
        status, _ = self.request("/v1/tasks", "POST", "bad-token", body)
        self.assertEqual(status, 401)
        body["owner"] = "attacker"
        status, _ = self.request("/v1/tasks", "POST", "alice-token", body)
        self.assertEqual(status, 400)
        status, _ = self.request("/v1/worker/run", "POST", "bad-worker")
        self.assertEqual(status, 401)
        self.assertEqual(self.ledger.status()["queued"], 0)

    def test_loopback_binding_and_health(self):
        with self.assertRaises(ValueError):
            create_server(self.intake, self.worker, self.intake.identity_verifier, host="0.0.0.0")
        status, health = self.request("/v1/health")
        self.assertEqual(status, 200)
        self.assertEqual(health["status"], "ok")


if __name__ == "__main__":
    unittest.main()
