"""Loopback-only HTTP harness that composes RC-181 intake with RC-183 worker core.

This is a test/local integration boundary, not a production server or identity provider.
"""
from __future__ import annotations

import json
import math
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

MAX_REQUEST_BYTES = 16384
_ALLOWED_HOSTS = {"127.0.0.1", "localhost"}


class _BoundedThreadingHTTPServer(ThreadingHTTPServer):
    """Threaded loopback server with bounded worker slots and socket read timeouts."""
    daemon_threads = True

    def __init__(self, server_address, handler, max_workers, request_timeout):
        self._slots = threading.BoundedSemaphore(max_workers)
        self.request_timeout_seconds = request_timeout
        super().__init__(server_address, handler)

    def get_request(self):
        request, client_address = super().get_request()
        request.settimeout(self.request_timeout_seconds)
        return request, client_address

    def process_request(self, request, client_address):
        if not self._slots.acquire(blocking=False):
            try:
                request.sendall(b"HTTP/1.0 503 Service Unavailable\\r\\nConnection: close\\r\\nContent-Length: 0\\r\\n\\r\\n")
            except OSError:
                pass
            finally:
                self.shutdown_request(request)
            return
        try:
            super().process_request(request, client_address)
        except Exception:
            self._slots.release()
            raise

    def process_request_thread(self, request, client_address):
        try:
            super().process_request_thread(request, client_address)
        finally:
            self._slots.release()


def create_server(intake, worker_core, user_verifier, host="127.0.0.1", port=0, max_workers=16, request_timeout=3.0):
    if host not in _ALLOWED_HOSTS:
        raise ValueError("local service must bind to loopback")
    if not callable(user_verifier):
        raise TypeError("user identity verifier required")
    if type(max_workers) is not int or not 1 <= max_workers <= 64:
        raise ValueError("max_workers must be between 1 and 64")
    if type(request_timeout) not in (int, float) or not math.isfinite(request_timeout) or not 0.1 <= request_timeout <= 10:
        raise ValueError("request_timeout must be between 0.1 and 10 seconds")

    class Handler(BaseHTTPRequestHandler):
        server_version = "RiverSSAI-Local/1"
        sys_version = ""

        def log_message(self, format, *args):
            # Avoid logging request bodies, bearer tokens, or user identifiers.
            return

        def _send(self, status, data):
            raw = json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(raw)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(raw)

        def _bearer(self):
            values = self.headers.get_all("Authorization", [])
            if len(values) != 1:
                return None
            header = values[0]
            if not header.startswith("Bearer "):
                return None
            token = header[7:]
            if not token or len(token) > 8192:
                return None
            return token

        def _body(self):
            lengths = self.headers.get_all("Content-Length", [])
            if len(lengths) != 1 or self.headers.get_all("Transfer-Encoding", []):
                return None
            length = lengths[0]
            if type(length) is not str or not length.isdigit():
                return None
            size = int(length)
            if size > MAX_REQUEST_BYTES:
                return None
            try:
                raw = self.rfile.read(size)
            except (OSError, TimeoutError):
                return None
            if len(raw) != size:
                return None
            def unique_pairs(pairs):
                result = {}
                for key, value in pairs:
                    if key in result:
                        raise ValueError("duplicate JSON key")
                    result[key] = value
                return result

            def reject_constant(_value):
                raise ValueError("non-finite JSON constant")

            try:
                return json.loads(
                    raw.decode("utf-8"),
                    object_pairs_hook=unique_pairs,
                    parse_constant=reject_constant,
                )
            except (UnicodeDecodeError, ValueError, RecursionError):
                return None

        def do_GET(self):
            path = urlsplit(self.path).path
            if path == "/v1/health":
                self._send(200, {"status": "ok"})
                return
            parts = path.split("/")
            if len(parts) == 5 and parts[1:3] == ["v1", "tasks"] and parts[4] == "result":
                token = self._bearer()
                subject = intake._claims(token, user_verifier) if token is not None else None
                if subject is None:
                    self._send(401, {"error": "identity_invalid"})
                    return
                task_id = parts[3]
                if not task_id or len(task_id) > 128:
                    self._send(400, {"error": "task_id_invalid"})
                    return
                result = worker_core.get_result(task_id, subject)
                if result is None:
                    self._send(404, {"error": "result_not_found"})
                    return
                self._send(200, result)
                return
            self._send(404, {"error": "not_found"})

        def do_POST(self):
            path = urlsplit(self.path).path
            if self.headers.get_all("Transfer-Encoding", []) or len(self.headers.get_all("Content-Length", [])) > 1:
                self._send(400, {"error": "request_framing_invalid"})
                return
            lengths = self.headers.get_all("Content-Length", [])
            if path == "/v1/worker/run" and lengths and lengths[0] != "0":
                self._send(400, {"error": "request_body_not_allowed"})
                return
            token = self._bearer()
            if path == "/v1/tasks":
                if token is None:
                    self._send(401, {"error": "identity_invalid"})
                    return
                request = self._body()
                expected = {"capability", "summary", "payload", "request_key"}
                if type(request) is not dict or set(request) != expected:
                    self._send(400, {"error": "request_shape_invalid"})
                    return
                result = intake.submit(
                    token, request["capability"], request["summary"],
                    request["payload"], request["request_key"],
                )
                status = result.get("status")
                codes = {
                    "accepted": 201, "replayed": 200, "conflict": 409,
                    "denied": 403, "invalid": 400, "queue_full": 429,
                    "audit_failed": 503, "error": 500,
                }
                if result.get("error") == "identity_invalid":
                    codes["denied"] = 401
                self._send(codes.get(status, 500), result)
                return
            if path == "/v1/worker/run":
                if token is None:
                    self._send(401, {"error": "worker_identity_invalid"})
                    return
                result = worker_core.run_once(token)
                self._send(401 if result.get("status") == "denied" else 200, result)
                return
            self._send(404, {"error": "not_found"})

    return _BoundedThreadingHTTPServer((host, port), Handler, max_workers, float(request_timeout))
