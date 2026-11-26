"""RC-164 contract test harness (mock-ledger contract only)."""
import unittest
from rc164_ledger_contract import LedgerContractMixin
class StubLedger:
 def lease_next(self,w,c):return None
 def complete(self,t,w,r):self.last_complete=(t,w,r)
 def fail(self,t,w,e):self.last_fail=(t,w,e)
class ContractTests(LedgerContractMixin,unittest.TestCase):
 def setUp(self):self.ledger=StubLedger()
 def test_completion_args(self):
  self.ledger.complete("id","worker",{"a":1});self.assertEqual(self.ledger.last_complete[1],"worker")
 def test_failure_args(self):
  self.ledger.fail("id","worker","worker_failed");self.assertEqual(self.ledger.last_fail[2],"worker_failed")
if __name__=="__main__":unittest.main()
