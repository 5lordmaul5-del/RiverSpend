"""RC-161 process-supervised toy-task executor. Not a hardened sandbox."""
from __future__ import annotations

import json
import math
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ALLOWED = frozenset({"echo", "json_validate", "metrics_report"})
MAX_INPUT_BYTES = 16384
MAX_OUTPUT_BYTES = 32768


class SupervisorError(RuntimeError):
    pass


class SandboxSupervisor:
    def __init__(self, timeout=1.5):
        if type(timeout) not in (int, float) or not math.isfinite(timeout) or not 0.1 <= timeout <= 10:
            raise ValueError("timeout bounds")
        self.timeout = float(timeout)

    def run(self, kind, payload):
        if type(kind) is not str or kind not in ALLOWED or type(payload) is not dict:
            raise SupervisorError("task denied")
        try:
            request = json.dumps(
                {"type": kind, "payload": payload},
                ensure_ascii=False,
                separators=(",", ":"),
                allow_nan=False,
            )
            encoded = request.encode("utf-8")
        except (TypeError, ValueError, UnicodeEncodeError, RecursionError):
            raise SupervisorError("invalid task payload") from None
        if len(encoded) > MAX_INPUT_BYTES:
            raise SupervisorError("input too large")

        child = Path(__file__).with_name("rc161_restricted_child.py")
        # The child receives only a minimal environment and a fresh working directory.
        env = {"PATH": os.defpath, "PYTHONIOENCODING": "utf-8"}
        with tempfile.TemporaryDirectory(prefix="rsworker-") as cwd:
            try:
                cp = subprocess.run(
                    [sys.executable, "-I", str(child)],
                    input=encoded,
                    capture_output=True,
                    cwd=cwd,
                    env=env,
                    timeout=self.timeout,
                    check=False,
                    close_fds=True,
                )
            except subprocess.TimeoutExpired as exc:
                raise SupervisorError("timeout") from exc
            except OSError:
                raise SupervisorError("child unavailable") from None
            if len(cp.stdout) > MAX_OUTPUT_BYTES or len(cp.stderr) > MAX_OUTPUT_BYTES:
                raise SupervisorError("child output too large")
            if cp.returncode != 0:
                raise SupervisorError("child failed")
            try:
                out = json.loads(cp.stdout.decode("utf-8"))
            except (UnicodeDecodeError, ValueError):
                raise SupervisorError("invalid child response") from None
            if type(out) is not dict or set(out) != {"ok", "result"} or out.get("ok") is not True:
                raise SupervisorError("task failed")
            if type(out["result"]) is not dict:
                raise SupervisorError("invalid child result")
            return out["result"]
