import unittest
from rc196_idempotency_registry import IdempotencyRegistry
from rc198_state_recovery import StateRecovery

class RecoveryTests(unittest.TestCase):
    def setUp(self):
        self.registry=IdempotencyRegistry()
        self.clock=lambda:100.0
        self.recovery=StateRecovery(self.registry,self.clock)
    def tearDown(self):
        self.registry.close()

    def test_absent(self):
        self.assertEqual(self.recovery.inspect("alice","missing")["status"],"absent")

    def test_completed(self):
        self.registry.begin("alice","k","payload")
        self.registry.complete("alice","k","done")
        self.assertEqual(self.recovery.inspect("alice","k")["status"],"completed")
        self.assertEqual(self.recovery.inspect("alice","k")["result"],"done")

    def test_recent_processing_waits(self):
        self.registry.begin("alice","k","p")
        self.assertEqual(self.recovery.classify_processing("alice","k",10)["action"],"wait")

    def test_stale_processing_requires_manual_reconciliation(self):
        self.registry.begin("alice","k","p")
        self.registry.db.execute("UPDATE idempotency SET updated=? WHERE owner=? AND key=?",(90,"alice","k"))
        decision=self.recovery.classify_processing("alice","k",5)
        self.assertEqual(decision["action"],"manual_reconciliation")
        self.assertNotIn("redispatch",decision)

    def test_owner_scoping(self):
        self.registry.begin("alice","same","p")
        self.assertEqual(self.recovery.inspect("bob","same")["status"],"absent")

    def test_invalid_staleness_threshold(self):
        for value in (-1,True,float("nan"),float("inf"),"5"):
            with self.subTest(value=value),self.assertRaises(ValueError):
                self.recovery.classify_processing("alice","k",value)

if __name__=="__main__":
    unittest.main()
