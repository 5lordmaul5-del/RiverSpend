import base64
import hashlib
import hmac
import json
import os
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from rc181_authenticated_intake import AuthenticatedTaskIntake
from rc181_payload_ledger import PayloadPersistentTaskLedger
from rc183_integrated_worker import WorkerCore
from river_ssai_jwt import HS256JWTVerifier
from river_ssai_local_service import create_server
from rc161_worker_executor import RC161SupervisorExecutor

KEY = b"local-test-key-not-for-production-0123456789"
ISSUER = "riverspend-test"
AUDIENCE = "river-ssai-test"
NOW = 1700000000


def b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def sign(claims):
    header = {"alg": "HS256", "typ": "JWT"}
    a = b64(json.dumps(header, separators=(",", ":"), sort_keys=True).encode())
    b = b64(json.dumps(claims, separators=(",", ":"), sort_keys=True).encode())
    message = a + "." + b
    return message + "." + b64(hmac.new(KEY, message.encode("ascii"), hashlib.sha256).digest())


def claims(subject, token_use, capabilities=None):
    value = {"iss": ISSUER, "aud": AUDIENCE, "sub": subject, "iat": NOW, "exp": NOW + 60, "token_use": token_use}
    if capabilities is not None:
        value["capabilities"] = capabilities
    return value


class TestPolicy:
    def authorize(self, capability, owner, **binding):
        return {"approval": "test-only"}

    def finish(self, authorization, success):
        return True

    def refund(self, authorization):
        return None


class SupervisedHTTPIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.tmp.name, "core.sqlite")
        self.ledger = PayloadPersistentTaskLedger(self.db_path, queue_limit=10, lease_seconds=10)
        self.jwt = HS256JWTVerifier(KEY, ISSUER, AUDIENCE, clock=lambda: NOW)
        self.user_token = sign(claims("alice", "user"))
        self.worker_token = sign(claims("worker-a", "worker", ["echo", "json_validate", "metrics_report"]))
        self.intake = AuthenticatedTaskIntake(
            self.ledger,
            self.jwt.verify_user,
            lambda subject, capability, summary, payload: subject == "alice" and capability in {"echo", "json_validate"},
        )
        self.worker = WorkerCore(
            self.ledger, self.db_path, self.jwt.verify_worker, TestPolicy(), RC161SupervisorExecutor(), max_attempts=2
        )
        self.server = create_server(self.intake, self.worker, self.jwt.verify_user, host="127.0.0.1", port=0)
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
        if token:
            headers["Authorization"] = "Bearer " + token
        if data is not None:
            headers["Content-Type"] = "application/json"
        req = Request(self.url + path, data=data, headers=headers, method=method)
        try:
            with urlopen(req, timeout=3) as response:
                return response.status, json.loads(response.read().decode("utf-8"))
        except HTTPError as err:
            try:
                return err.code, json.loads(err.read().decode("utf-8"))
            finally:
                err.close()

    def test_http_intake_worker_subprocess_result_and_owner_scope(self):
        task_body = {"capability": "echo", "summary": "bounded echo", "payload": {"text": "hello"}, "request_key": "supervised-1"}
        status, accepted = self.request("/v1/tasks", "POST", self.user_token, task_body)
        self.assertEqual(status, 201)
        task_id = accepted["task_id"]

        status, run = self.request("/v1/worker/run", "POST", self.worker_token)
        self.assertEqual(status, 200)
        self.assertEqual(run["status"], "completed")

        status, result = self.request("/v1/tasks/%s/result" % task_id, token=self.user_token)
        self.assertEqual(status, 200)
        self.assertEqual(result["result"]["echo"]["text"], "hello")
        self.assertEqual(result["result"]["echo"], {"text": "hello"})

        other_token = sign(claims("bob", "user"))
        status, _ = self.request("/v1/tasks/%s/result" % task_id, token=other_token)
        self.assertEqual(status, 404)
        self.assertIn("completed", [event["action"] for event in self.worker.events(task_id)])
        self.assertIn("intake_accepted", [event["action"] for event in self.ledger.intake_events(task_id)])

    def test_supervisor_failure_retries_and_exhausts_without_leaking_details(self):
        task_body = {"capability": "json_validate", "summary": "invalid json probe", "payload": {"json": "not-json"}, "request_key": "supervised-2"}
        status, accepted = self.request("/v1/tasks", "POST", self.user_token, task_body)
        self.assertEqual(status, 201)
        task_id = accepted["task_id"]

        _, first = self.request("/v1/worker/run", "POST", self.worker_token)
        self.assertEqual(first["status"], "retry")
        self.assertEqual(self.ledger.status()["queued"], 1)

        _, second = self.request("/v1/worker/run", "POST", self.worker_token)
        self.assertEqual(second["status"], "exhausted")
        self.assertEqual(self.ledger.status()["cancelled"], 1)
        actions = [event["action"] for event in self.worker.events(task_id)]
        self.assertIn("retry_scheduled", actions)
        self.assertIn("attempts_exhausted", actions)


if __name__ == "__main__":
    unittest.main()
