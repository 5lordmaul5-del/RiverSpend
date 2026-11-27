import unittest
import resource
from unittest.mock import call, patch

from rc161_restricted_child import apply_resource_limits, RESOURCE_LIMITS
from rc161_sandbox_supervisor import SandboxSupervisor, SupervisorError


class SupervisorTests(unittest.TestCase):
    def setUp(self):
        self.supervisor = SandboxSupervisor()

    def test_echo(self):
        self.assertEqual(self.supervisor.run("echo", {"x": 1}), {"echo": {"x": 1}})

    def test_json(self):
        self.assertEqual(self.supervisor.run("json_validate", {"json": "[]"}), {"valid": True})

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
