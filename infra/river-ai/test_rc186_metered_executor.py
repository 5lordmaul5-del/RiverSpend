"""RC-186 adapter tests."""
import tempfile,unittest
from rc184_usage_ledger import UsageLedger
from rc185_atomic_quota import AtomicQuota
from rc186_metered_executor import MeteredExecutor,MeteredExecutionError
class T(unittest.TestCase):
 def setUp(self): self.tmp=tempfile.TemporaryDirectory(); self.path=self.tmp.name+"/db"; self.q=AtomicQuota(self.path)
 def tearDown(self): self.tmp.cleanup()
 def test_success_reconciles_usage(self):
  adapter=MeteredExecutor(self.q,lambda task:{"usage_tokens":25,"ok":True},lambda task:("u","free"),lambda task:"month")
  result=adapter({"id":"task1","estimated_tokens":50}); self.assertTrue(result["ok"]); self.assertEqual(UsageLedger(self.path).total("u","month"),25)
 def test_quota_rejects(self):
  adapter=MeteredExecutor(self.q,lambda task:{"usage_tokens":1},lambda task:("u","free"),lambda task:"m")
  self.assertRaises(MeteredExecutionError,adapter,{"id":"a","estimated_tokens":100001})
 def test_overestimate_reconciliation_guard(self):
  adapter=MeteredExecutor(self.q,lambda task:{"usage_tokens":60},lambda task:("u","free"),lambda task:"m")
  self.assertRaises(MeteredExecutionError,adapter,{"id":"a","estimated_tokens":50})
 def test_bad_estimate(self):
  adapter=MeteredExecutor(self.q,lambda task:None,lambda task:("u","free"),lambda task:"m")
  self.assertRaises(MeteredExecutionError,adapter,{"id":"a","estimated_tokens":0})
if __name__=="__main__":unittest.main()
