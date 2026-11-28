import unittest
import os
import resource
import signal
import sys
import tempfile
import time
from unittest.mock import Mock, call, patch
import subprocess

from rc161_restricted_child import apply_resource_limits, RESOURCE_LIMITS, MAX_CHILD_FILE_BYTES
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

    def test_timeout_kills_real_process_group_descendant(self):
        with tempfile.TemporaryDirectory() as directory:
            pid_file = os.path.join(directory, "descendant.pid")
            code = (
                "import os,subprocess,sys,time; "
                "p=subprocess.Popen([sys.executable,'-c','import time; time.sleep(60)']); "
                "open(os.environ['RC161_TEST_PID_FILE'],'w').write(str(p.pid)); "
                "time.sleep(60)"
            )
            real_popen = subprocess.Popen

            def spawn_descendant(*args, **kwargs):
                kwargs["env"] = {**kwargs["env"], "RC161_TEST_PID_FILE": pid_file}
                return real_popen([sys.executable, "-c", code], **kwargs)

            with patch("subprocess.Popen", side_effect=spawn_descendant):
                with self.assertRaisesRegex(SupervisorError, "timeout"):
                    SandboxSupervisor(timeout=1.0).run("echo", {"probe": True})

            self.assertTrue(os.path.isfile(pid_file), "descendant PID was not recorded")
            with open(pid_file, encoding="ascii") as pid_input:
                descendant_pid = int(pid_input.read())
            stopped = False
            for _ in range(50):
                try:
                    with open(f"/proc/{descendant_pid}/stat", encoding="ascii") as stat_file:
                        state = stat_file.read().split(")", 1)[1].strip().split()[0]
                    stopped = state in {"Z", "X"}
                except FileNotFoundError:
                    stopped = True
                if stopped:
                    break
                time.sleep(0.02)
            self.assertTrue(stopped, "descendant process survived timeout group kill")

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

    def test_stderr_file_limit_rejected_before_read(self):
        valid_response = b'{"ok":true,"result":{"echo":{"x":1}}}\n'

        def fake_popen(*args, **kwargs):
            kwargs["stdout"].write(valid_response)
            kwargs["stdout"].flush()
            kwargs["stderr"].write(b"x" * (MAX_CHILD_FILE_BYTES + 1))
            kwargs["stderr"].flush()
            process = Mock()
            process.pid = 1
            process.returncode = 0
            process.communicate.return_value = (None, None)
            return process

        with patch("subprocess.Popen", side_effect=fake_popen):
            with self.assertRaisesRegex(SupervisorError, "child output too large"):
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

    def test_child_launch_uses_minimal_environment_isolated_mode_and_temp_cwd(self):
        captured = {}
        fake = Mock()
        fake.returncode = 0
        fake.communicate.return_value = (None, None)

        def fake_popen(argv, **kwargs):
            captured["argv"] = argv
            captured["kwargs"] = kwargs
            kwargs["stdout"].write(b'{"ok":true,"result":{"echo":{"x":1}}}\n')
            kwargs["stdout"].flush()
            return fake

        with patch("subprocess.Popen", side_effect=fake_popen):
            self.assertEqual(self.supervisor.run("echo", {"x": 1}), {"echo": {"x": 1}})

        kwargs = captured["kwargs"]
        self.assertEqual(kwargs["env"], {"PATH": os.defpath, "PYTHONIOENCODING": "utf-8"})
        self.assertTrue(kwargs["cwd"].startswith(tempfile.gettempdir()))
        self.assertIn("rsworker-", kwargs["cwd"])
        self.assertTrue(kwargs["start_new_session"])
        self.assertTrue(kwargs["close_fds"])
        self.assertEqual(captured["argv"][1], "-I")
        self.assertNotIn("HOME", kwargs["env"])
        self.assertNotIn("RIVERAUTH_ISSUER_URL", kwargs["env"])
        self.assertNotIn("RIVER_CLOUD_API_DB_PASSWORD", kwargs["env"])

    def test_supervisor_timeout_bounds(self):
        for value in (0, 0.01, 10.01, float("nan"), float("inf"), "1"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                SandboxSupervisor(timeout=value)


if __name__ == "__main__":
    unittest.main()
