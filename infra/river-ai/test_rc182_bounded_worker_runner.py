import unittest
from rc182_bounded_worker_runner import BoundedWorkerRunner, WorkerRejected


class FakeLedger:
    def __init__(self, task=None, completion=True):
        self.task = task or {"id": "t1", "capability": "demo", "owner": "u1", "payload": {"x": 1}}
        self.completion = completion
        self.completed = []

    def lease_next(self, worker_id, capabilities):
        if self.task is None:
            return None
        task, self.task = self.task, None
        return task

    def complete(self, task_id, worker_id):
        self.completed.append((task_id, worker_id))
        return self.completion


class RunnerTests(unittest.TestCase):
    def test_success_completes_once(self):
        ledger = FakeLedger()
        runner = BoundedWorkerRunner(ledger, "w1", ("demo",), lambda w, t: True,
                                    lambda t: True, lambda t: "ok")
        self.assertEqual(runner.run_once(), {"task_id": "t1", "state": "completed", "result": "ok"})
        self.assertEqual(ledger.completed, [("t1", "w1")])

    def test_authorization_denied_fails_closed(self):
        ledger = FakeLedger()
        executed = []
        runner = BoundedWorkerRunner(ledger, "w1", ("demo",), lambda w, t: False,
                                    lambda t: True, lambda t: executed.append(t))
        with self.assertRaises(WorkerRejected):
            runner.run_once()
        self.assertEqual(executed, [])
        self.assertEqual(ledger.completed, [])

    def test_policy_denied_fails_closed(self):
        ledger = FakeLedger()
        executed = []
        runner = BoundedWorkerRunner(ledger, "w1", ("demo",), lambda w, t: True,
                                    lambda t: False, lambda t: executed.append(t))
        with self.assertRaises(WorkerRejected):
            runner.run_once()
        self.assertEqual(executed, [])

    def test_completion_rejected(self):
        ledger = FakeLedger(completion=False)
        runner = BoundedWorkerRunner(ledger, "w1", ("demo",), lambda w, t: True,
                                    lambda t: True, lambda t: "ok")
        with self.assertRaises(WorkerRejected):
            runner.run_once()

    def test_no_task(self):
        ledger = FakeLedger(task=None)
        runner = BoundedWorkerRunner(ledger, "w1", ("demo",), lambda w, t: True,
                                    lambda t: True, lambda t: "ok")
        self.assertIsNone(runner.run_once())


if __name__ == "__main__":
    unittest.main()
