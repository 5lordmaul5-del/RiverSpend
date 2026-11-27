import unittest
from rc203_bankflow_sandbox import BankFlowSandbox

class BankFlowTests(unittest.TestCase):
 def test_happy_path_is_simulated(self):
  s=BankFlowSandbox(); t=s.create("SIM-A","SIM-B",125); s.authorize(t.transfer_id); s.execute(t.transfer_id)
  self.assertEqual(t.status,"completed"); self.assertEqual(s.balances["SIM-A"],9875)
  self.assertTrue(s.receipt(t.transfer_id)["sandbox_only"])
 def test_authorization_required(self):
  s=BankFlowSandbox(); t=s.create("SIM-A","SIM-B",1)
  with self.assertRaises(ValueError): s.execute(t.transfer_id)
 def test_reject_non_sim_account(self):
  with self.assertRaises(ValueError): BankFlowSandbox().create("IBAN123","SIM-B",10)
 def test_limit_review(self):
  s=BankFlowSandbox(daily_limits={"SIM-A":50}); t=s.create("SIM-A","SIM-B",51)
  s.authorize(t.transfer_id); s.execute(t.transfer_id); self.assertEqual(t.status,"review")
 def test_idempotency(self):
  s=BankFlowSandbox(); a=s.create("SIM-A","SIM-B",25,idempotency_key="key")
  b=s.create("SIM-A","SIM-B",25,idempotency_key="key"); self.assertEqual(a.transfer_id,b.transfer_id)
 def test_negative_amount(self):
  with self.assertRaises(ValueError): BankFlowSandbox().create("SIM-A","SIM-B",-1)
if __name__=="__main__": unittest.main()
