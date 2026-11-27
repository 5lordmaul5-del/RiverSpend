import unittest
import resource
import signal
from unittest.mock import Mock, call, patch
import subprocess

from rc161_restricted_child import apply_resource_limits, RESOURCE_LIMITS
from rc161_sandbox_supervisor import SandboxSupervisor, SupervisorError, MAX_OUTPUT_BYTES


class SupervisorTests(unittest.TestCase):
    def setUp(self):
        self.supervisor = SandboxSupervisor()

    def test_echo(self):
        self.assertEqual(self.supervisor.run("echo", {"x": 1}), {"echo": {"x": 1}})

    def test_json(self):
        self.assertEqual(self.supervisor.run("json_validate", {"json": "[]"}), {"valid": True})

    def test_json_validate_rejects_duplicate_keys_nested(self):
        for raw in ('{"x":1,"x":2}', '{"outer":{"x":1,"x":2}}'):
            with self.subTest(raw=raw), self.assertRaises(SupervisorError):
                self.supervisor.run("json_validate", {"json": raw})

    def test_json_validate_rejects_nonfinite_constants(self):
        for raw in ("NaN", "Infinity", "-Infinity", '{"value":NaN}'):
            with self.subTest(raw=raw), self.assertRaises(SupervisorError):
                self.supervisor.run("json_validate", {"json": raw})

    def test_metrics(self):
        self.assertEqual(
            self.supervisor.run("metrics_report", {"total": 3, "success": 2, "failed": 1}),
            {"total": 3, "success": 2, "failed": 1},
        )

    def test_unknown_capability_rejected(self):
        with self.assertRaises(SupervisorError):
            self.supervisor.run("shell", {"cmd": "x"})

    def test_payload_bound(self):
        with self.assertRaises(SupervisorError):
            self.supervisor.run("echo", {"x": "a" * 20000})

    def test_invalid_json_task_fails(self):
        with self.assertRaises(SupervisorError):
            self.supervisor.run("json_validate", {"json": "bad"})

    def test_nonfinite_and_non_json_payloads_rejected(self):
        with self.assertRaises(SupervisorError):
            self.supervisor.run("echo", {"value": float("nan")})
        with self.assertRaises(SupervisorError):
            self.supervisor.run("echo", {"value": object()})

    def test_timeout_kills_entire_child_process_group(self):
        fake = Mock()
        fake.pid = 4242
        fake.returncode = -signal.SIGKILL
        fake.communicate.side_effect = [
            subprocess.TimeoutExpired(["child"], 0.1),
            (None, None),
        ]
        with patch("subprocess.Popen", return_value=fake) as popen, patch("os.killpg") as killpg:
            with self.assertRaises(SupervisorError):
                SandboxSupervisor(timeout=0.1).run("echo", {"x": 1})
        self.assertTrue(popen.call_args.kwargs["start_new_session"])
        self.assertIs(popen.call_args.kwargs["stdin"], subprocess.PIPE)
        killpg.assert_called_once_with(4242, signal.SIGKILL)
        self.assertEqual(fake.communicate.call_count, 2)

    def test_output_limit_rejected_before_read(self):
        def fake_popen(*args, **kwargs):
            kwargs["stdout"].write(b"x" * (MAX_OUTPUT_BYTES + 1))
            kwargs["stdout"].flush()
            process = Mock()
            process.pid = 1
            process.returncode = 0
            process.communicate.return_value = (None, None)
            return process

        with patch("subprocess.Popen", side_effect=fake_popen):
            with self.assertRaisesRegex(SupervisorError, "output too large"):
                self.supervisor.run("echo", {"x": 1})

    def test_child_resource_limits_are_applied(self):
        expected = [call(name, bounds) for name, bounds in RESOURCE_LIMITS]
        with patch("resource.setrlimit") as setrlimit:
            apply_resource_limits()
        self.assertEqual(setrlimit.call_args_list, expected)
        self.assertEqual(
            {name for name, _ in RESOURCE_LIMITS},
            {resource.RLIMIT_CPU, resource.RLIMIT_AS, resource.RLIMIT_FSIZE, resource.RLIMIT_NOFILE, resource.RLIMIT_CORE},
        )


if __name__ == "__main__":
    unittest.main()
