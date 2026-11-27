import unittest
from rc161_sandbox_supervisor import SandboxSupervisor, SupervisorError


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


if __name__ == "__main__":
    unittest.main()
