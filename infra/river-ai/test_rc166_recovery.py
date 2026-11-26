import unittest
from rc166_recovery import recovery_decision
class Tests(unittest.TestCase):
 def test_timeout_retry(self):self.assertEqual(recovery_decision("timeout",1,3)["delay_seconds"],2)
 def test_backoff(self):self.assertEqual(recovery_decision("worker_failed",4,8)["delay_seconds"],16)
 def test_cap(self):self.assertEqual(recovery_decision("timeout",6,8,max_delay_seconds=10)["delay_seconds"],10)
 def test_limit(self):self.assertFalse(recovery_decision("timeout",3,3)["retry"])
 def test_unknown_error(self):self.assertFalse(recovery_decision("permission_denied",1,3)["retry"])
 def test_invalid(self):self.assertFalse(recovery_decision("",0,3)["retry"])
if __name__=="__main__":unittest.main()
