import unittest
from rc194_recovery_coordinator import RecoveryCoordinator


class Tests(unittest.TestCase):
    def test_backoff_then_queue(self):
        r = RecoveryCoordinator(clock=lambda: 10., random_fn=lambda: .5)
        i = r.enqueue("k", max_attempts=3)
        self.assertTrue(r.claim(i))
        r.fail(i, "oops", base_delay=2, jitter=0)
        self.assertEqual(r.get(i)[3], "queued")
        self.assertEqual(r.get(i)[4], 1)
        self.assertEqual(r.get(i)[5], 12)

    def test_deadletter(self):
        r = RecoveryCoordinator(clock=lambda: 10., random_fn=lambda: .5)
        i = r.enqueue("k", max_attempts=1)
        r.claim(i); r.fail(i, "fatal")
        self.assertEqual(r.get(i)[3], "dead_letter")
        self.assertEqual(len(r.dead_letters()), 1)

    def test_claim_once(self):
        r = RecoveryCoordinator()
        i = r.enqueue("k")
        self.assertTrue(r.claim(i))
        self.assertFalse(r.claim(i))

    def test_fail_requires_running_state(self):\n        r = RecoveryCoordinator()\n        i = r.enqueue("k")\n        self.assertFalse(r.fail(i, "premature"))\n        self.assertEqual(r.get(i)[3], "queued")\n        self.assertTrue(r.claim(i))\n        self.assertTrue(r.fail(i, "after claim"))\n        self.assertEqual(r.get(i)[3], "queued")\n\n    def test_success(self):
        r = RecoveryCoordinator()
        i = r.enqueue("k")
        r.claim(i)
        self.assertTrue(r.succeed(i))
        self.assertEqual(r.get(i)[3], "completed")

    def test_retry_delay_capped(self):
        r = RecoveryCoordinator(clock=lambda: 10., random_fn=lambda: .5)
        i = r.enqueue("k", max_attempts=5)
        r.claim(i)
        r.fail(i, "x", base_delay=1000, max_delay=3, jitter=0)
        self.assertEqual(r.get(i)[5], 13)

    def test_random_source_validated(self):
        r = RecoveryCoordinator(random_fn=lambda: 2)
        i = r.enqueue("k"); r.claim(i)
        with self.assertRaises(ValueError):
            r.fail(i, "x")

    def test_invalid(self):
        r = RecoveryCoordinator()
        with self.assertRaises(ValueError):
            r.enqueue("", max_attempts=0)
        with self.assertRaises(ValueError):
            r.due(0)


if __name__ == "__main__":
    unittest.main()
