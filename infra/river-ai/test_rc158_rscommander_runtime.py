import unittest
from rc158_rscommander_runtime import RSCommander, Specialist

class CommanderTests(unittest.TestCase):
    def setUp(self):
        self.c = RSCommander((Specialist("tester", ("test",)), Specialist("builder", ("build",))),
                             queue_limit=2, active_limit=1)

    def test_bounded_queue(self):
        self.c.submit("test", "first")
        self.c.submit("test", "second")
        with self.assertRaises(OverflowError):
            self.c.submit("test", "third")

    def test_dispatch_cap_and_complete(self):
        a = self.c.submit("test", "check")
        self.c.submit("build", "compile")
        leased = self.c.dispatch()
        self.assertEqual(len(leased), 1)
        self.assertEqual(leased[0].id, a.id)
        self.assertEqual(self.c.status()["active_leases"], 1)
        self.c.complete(a.id)
        self.assertEqual(self.c.status()["completed"], 1)

    def test_unknown_capability_rejected(self):
        with self.assertRaises(ValueError):
            self.c.submit("unknown", "task")

    def test_cancel_queued(self):
        t = self.c.submit("test", "cancel me")
        self.assertTrue(self.c.cancel(t.id))
        self.assertEqual(self.c.status()["queued"], 0)

    def test_summary_limit(self):
        with self.assertRaises(ValueError):
            self.c.submit("test", "x" * 501)

if __name__ == "__main__":
    unittest.main()
