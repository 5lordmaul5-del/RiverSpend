"""RC-161 process-supervised toy-task executor. Not a hardened sandbox."""
from __future__ import annotations

import json
import math
import os
import signal
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
        # Redirect to files instead of pipes so communicate() cannot buffer unlimited output.
        env = {"PATH": os.defpath, "PYTHONIOENCODING": "utf-8"}
        with tempfile.TemporaryDirectory(prefix="rsworker-") as cwd:
            stdout_path = Path(cwd) / "stdout.bin"
            stderr_path = Path(cwd) / "stderr.bin"
            try:
                with stdout_path.open("wb") as stdout_file, stderr_path.open("wb") as stderr_file:
                    proc = subprocess.Popen(
                        [sys.executable, "-I", str(child)],
                        stdin=subprocess.PIPE,
                        stdout=stdout_file,
                        stderr=stderr_file,
                        cwd=cwd,
                        env=env,
                        start_new_session=True,
                        check=False,
                        close_fds=True,
                    )
                    try:
                        proc.communicate(encoded, timeout=self.timeout)
                    except subprocess.TimeoutExpired:
                        # Kill the complete process group, not just the direct child.
                        try:
                            os.killpg(proc.pid, signal.SIGKILL)
                        except ProcessLookupError:
                            pass
                        except OSError:
                            # Fall back to killing the direct child if group termination fails.
                            try:
                                proc.kill()
                            except OSError:
                                pass
                        proc.communicate()
                        raise SupervisorError("timeout") from None
            except OSError:
                raise SupervisorError("child unavailable") from None

            # Child RLIMIT_FSIZE also constrains the files; this parent-side check
            # rejects any unexpected oversized file before reading it into memory.
            if stdout_path.stat().st_size > MAX_OUTPUT_BYTES or stderr_path.stat().st_size > MAX_OUTPUT_BYTES:
                raise SupervisorError("child output too large")
            stdout = stdout_path.read_bytes()
            if proc.returncode != 0:
                raise SupervisorError("child failed")
            try:
                out = json.loads(stdout.decode("utf-8"))
            except (UnicodeDecodeError, ValueError):
                raise SupervisorError("invalid child response") from None
            if type(out) is not dict or set(out) != {"ok", "result"} or out.get("ok") is not True:
                raise SupervisorError("task failed")
            if type(out["result"]) is not dict:
                raise SupervisorError("invalid child result")
            return out["result"]
