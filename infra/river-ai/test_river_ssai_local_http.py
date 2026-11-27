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

from rc181_payload_ledger import PayloadPersistentTaskLedger
from rc181_authenticated_intake import AuthenticatedTaskIntake
from rc183_integrated_worker import WorkerCore
from river_ssai_local_service import create_server
from river_ssai_jwt import HS256JWTVerifier


KEY = b"local-test-key-not-for-production-0123456789"
ISSUER = "riverspend-test"
AUDIENCE = "river-ssai-test"
NOW = 1700000000


def b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def sign(claims):
    header={"alg":"HS256","typ":"JWT"}
    a=b64(json.dumps(header,separators=(",",":"),sort_keys=True).encode())
    b=b64(json.dumps(claims,separators=(",",":"),sort_keys=True).encode())
    message=a+"."+b
    return message+"."+b64(hmac.new(KEY,message.encode("ascii"),hashlib.sha256).digest())


def claims(subject, capabilities=None):
    c={"iss":ISSUER,"aud":AUDIENCE,"sub":subject,"iat":NOW,"exp":NOW+60}
    if capabilities is not None:
        c["capabilities"]=capabilities
    return c


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
        self.jwt = HS256JWTVerifier(KEY, ISSUER, AUDIENCE, clock=lambda: NOW)
        self.alice = sign(claims("alice"))
        self.bob = sign(claims("bob"))
        self.worker_token = sign(claims("worker-a", ["echo"]))
        self.user_verify = self.jwt.verify_user
        def intake_policy(subject, capability, summary, payload):
            return subject == "alice" and capability == "echo"
        self.intake = AuthenticatedTaskIntake(self.ledger, self.user_verify, intake_policy)
        self.worker = WorkerCore(self.ledger, self.path, self.jwt.verify_worker, Policy(), EchoExecutor())
        self.server = create_server(self.intake, self.worker, self.user_verify, host="127.0.0.1", port=0)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.url = "http://127.0.0.1:%s" % self.server.server_address[1]

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.tmp.cleanup()

    def request_raw(self, path, raw, token=None):
        headers = {"Content-Type": "application/json"}
        if token is not None:
            headers["Authorization"] = "Bearer " + token
        req = Request(self.url + path, data=raw, headers=headers, method="POST")
        try:
            with urlopen(req, timeout=3) as response:
                return response.status, json.loads(response.read().decode("utf-8"))
        except HTTPError as err:
            return err.code, json.loads(err.read().decode("utf-8"))

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
        status, intake = self.request("/v1/tasks", "POST", self.alice, body)
        self.assertEqual(status, 201)
        task_id = intake["task_id"]
        status, run = self.request("/v1/worker/run", "POST", self.worker_token)
        self.assertEqual(status, 200)
        self.assertEqual(run["status"], "completed")
        status, result = self.request("/v1/tasks/%s/result" % task_id, token=self.alice)
        self.assertEqual(status, 200)
        self.assertEqual(result["result"]["echo"], "hello")
        self.assertEqual(result["result"]["key"], task_id)
        status, _ = self.request("/v1/tasks/%s/result" % task_id, token=self.bob)
        self.assertEqual(status, 404)

    def test_replay_after_completion_returns_same_task_and_idle_worker(self):
        body = {"capability":"echo","summary":"hello","payload":{"text":"hello"},"request_key":"request-2"}
        first_status, first = self.request("/v1/tasks", "POST", self.alice, body)
        self.assertEqual(first_status, 201)
        self.request("/v1/worker/run", "POST", self.worker_token)
        replay_status, replay = self.request("/v1/tasks", "POST", self.alice, body)
        self.assertEqual(replay_status, 200)
        self.assertEqual(replay["status"], "replayed")
        self.assertEqual(replay["task_id"], first["task_id"])
        _, run = self.request("/v1/worker/run", "POST", self.worker_token)
        self.assertEqual(run["status"], "idle")

    def test_auth_and_request_shape_fail_closed(self):
        body = {"capability":"echo","summary":"hello","payload":{"text":"hello"},"request_key":"request-3"}
        status, _ = self.request("/v1/tasks", "POST", "bad-token", body)
        self.assertEqual(status, 401)
        body["owner"] = "attacker"
        status, _ = self.request("/v1/tasks", "POST", self.alice, body)
        self.assertEqual(status, 400)
        status, _ = self.request("/v1/worker/run", "POST", "bad-worker")
        self.assertEqual(status, 401)
        self.assertEqual(self.ledger.status()["queued"], 0)

    def test_duplicate_json_keys_rejected_before_intake(self):
        raw = b'{"capability":"echo","capability":"other","summary":"hello","payload":{"text":"hello"},"request_key":"dup-1"}'
        status, response = self.request_raw("/v1/tasks", raw, self.alice)
        self.assertEqual(status, 400)
        self.assertEqual(response["error"], "request_shape_invalid")
        self.assertEqual(self.ledger.status()["queued"], 0)

    def test_nonfinite_json_constant_rejected_before_intake(self):
        raw = b'{"capability":"echo","summary":"hello","payload":{"text":NaN},"request_key":"nan-1"}'
        status, response = self.request_raw("/v1/tasks", raw, self.alice)
        self.assertEqual(status, 400)
        self.assertEqual(response["error"], "request_shape_invalid")
        self.assertEqual(self.ledger.status()["queued"], 0)

    def test_loopback_binding_and_health(self):
        with self.assertRaises(ValueError):
            create_server(self.intake, self.worker, self.user_verify, host="0.0.0.0")
        status, health = self.request("/v1/health")
        self.assertEqual(status, 200)
        self.assertEqual(health["status"], "ok")


if __name__ == "__main__":
    unittest.main()
