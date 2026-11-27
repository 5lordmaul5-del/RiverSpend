import unittest
from rc199_execution_safety_validator import validate
class T(unittest.TestCase):
 def test_consistent(self):self.assertTrue(validate("running","active",True,True,"processing")["safe"])
 def test_lease(self):self.assertIn("lease_invalid",validate("leased","idle",False,True,"processing")["issues"])
 def test_fencing(self):self.assertIn("fencing_not_current",validate("running","active",True,False,"processing")["issues"])
 def test_completed_mismatch(self):self.assertFalse(validate("completed","active",True,True,"processing")["safe"])
 def test_safe_block(self):self.assertEqual(validate("running","unknown",True,True,"processing")["decision"],"block_and_reconcile")
if __name__=="__main__":unittest.main()
