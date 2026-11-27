import unittest
from rc196_idempotency_registry import IdempotencyRegistry
from rc198_state_recovery import StateRecovery
class T(unittest.TestCase):
 def test_absent(self):
  self.assertEqual(StateRecovery(IdempotencyRegistry()).inspect("x")["status"],"absent")
 def test_completed(self):
  r=IdempotencyRegistry();r.begin("k","p");r.complete("k","r")
  self.assertEqual(StateRecovery(r).inspect("k")["status"],"completed")
 def test_recent_wait(self):
  clock=lambda:100;r=IdempotencyRegistry(clock=clock);r.begin("k","p")
  self.assertEqual(StateRecovery(r,clock).classify_processing("k",10)["action"],"wait")
 def test_stale_requires_manual(self):
  clock=lambda:100;r=IdempotencyRegistry(clock=clock);r.begin("k","p")
  x=StateRecovery(r,clock).classify_processing("k",5)
  self.assertEqual(x["action"],"manual_reconciliation")
  self.assertNotIn("redispatch",x)
if __name__=="__main__":unittest.main()
