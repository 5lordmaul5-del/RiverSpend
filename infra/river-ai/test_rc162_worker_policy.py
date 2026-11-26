import unittest
from rc162_worker_policy import WorkerPolicy,PolicyDenied
class Tests(unittest.TestCase):
 def test_allow(self):
  p=WorkerPolicy();rid=p.authorize("echo","alice");p.finish(rid,True)
 def test_deny_unknown(self):
  with self.assertRaises(PolicyDenied):WorkerPolicy().authorize("shell","alice")
 def test_approval(self):
  p=WorkerPolicy()
  with self.assertRaises(PolicyDenied):p.authorize("echo","alice",requires_approval=True)
  p.authorize("echo","alice",requires_approval=True,approved=True)
 def test_owner_budget(self):
  p=WorkerPolicy(per_owner_limit=2,global_limit=5);p.authorize("echo","a",2)
  with self.assertRaises(PolicyDenied):p.authorize("echo","a")
 def test_global_budget(self):
  p=WorkerPolicy(per_owner_limit=5,global_limit=2);p.authorize("echo","a",2)
  with self.assertRaises(PolicyDenied):p.authorize("echo","b")
 def test_refund(self):
  p=WorkerPolicy();rid=p.authorize("echo","a",2);self.assertTrue(p.refund(rid));self.assertEqual(p.total,0)
 def test_audit(self):
  p=WorkerPolicy();p.authorize("echo","a");self.assertEqual(p.snapshot()["audit_events"],1)
if __name__=="__main__":unittest.main()
