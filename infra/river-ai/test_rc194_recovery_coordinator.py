import unittest
from rc194_recovery_coordinator import RecoveryCoordinator
class Tests(unittest.TestCase):
 def test_backoff_then_queue(self):
  t=[10.];r=RecoveryCoordinator(clock=lambda:t[0],random_fn=lambda:0.5);i=r.enqueue("k",max_attempts=3)
  self.assertTrue(r.claim(i));r.fail(i,"oops",base_delay=2,jitter=0);self.assertEqual(r.get(i)[3],"queued");self.assertEqual(r.get(i)[4],1);self.assertEqual(r.get(i)[5],12)
 def test_deadletter_limit(self):
  t=[10.];r=RecoveryCoordinator(clock=lambda:t[0],random_fn=lambda:0.5);i=r.enqueue("k",max_attempts=1);r.claim(i);r.fail(i,"fatal")
  self.assertEqual(r.get(i)[3],"dead_letter");self.assertEqual(len(r.dead_letters()),1)
 def test_claim_once(self):
  r=RecoveryCoordinator();i=r.enqueue("k");self.assertTrue(r.claim(i));self.assertFalse(r.claim(i))
 def test_success(self):
  r=RecoveryCoordinator();i=r.enqueue("k");r.claim(i);self.assertTrue(r.succeed(i));self.assertEqual(r.get(i)[3],"completed")
 def test_retry_delay_capped_and_random_validated(self):\n  r=RecoveryCoordinator(clock=lambda:10,random_fn=lambda:0.5);i=r.enqueue("k",max_attempts=5);r.claim(i)\n  r.fail(i,"x",base_delay=1000,max_delay=3,jitter=0);self.assertEqual(r.get(i)[5],13)\n  r2=RecoveryCoordinator(random_fn=lambda:2);j=r2.enqueue("k");r2.claim(j)\n  with self.assertRaises(ValueError):r2.fail(j,"x")\n def test_invalid(self):
  r=RecoveryCoordinator()
  with self.assertRaises(ValueError):r.enqueue("",max_attempts=0)
if __name__=="__main__":unittest.main()
