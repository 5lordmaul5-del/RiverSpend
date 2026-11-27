import unittest
from rc200_unified_execution_control import UnifiedExecutionControl
class T(unittest.TestCase):
 def setUp(self):self.core=UnifiedExecutionControl()
 def test_safe(self):
  x=self.core.evaluate("running","active",True,True,"processing");self.assertTrue(x["safe"]);self.assertFalse(x["execution_requested"])
 def test_block(self):
  x=self.core.evaluate("running","unknown",True,True,"processing");self.assertFalse(x["safe"]);self.assertEqual(x["decision"],"block_and_reconcile")
 def test_lease_invalid(self):
  self.assertIn("lease_invalid",self.core.evaluate("leased","idle",False,True,"processing")["issues"])
if __name__=="__main__":unittest.main()
