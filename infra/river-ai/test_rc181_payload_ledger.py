import os,tempfile,unittest
from rc181_payload_ledger import PayloadPersistentTaskLedger,PayloadLedgerError
class Tests(unittest.TestCase):
 def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.path=os.path.join(self.tmp.name,'db.sqlite');self.l=PayloadPersistentTaskLedger(self.path,2,5)
 def tearDown(self):self.tmp.cleanup()
 def test_payload_owner_roundtrip(self):
  tid=self.l.enqueue('echo','task','user-1',{'text':'hi'});lease=self.l.lease_next('worker-a',('echo',));self.assertEqual(lease['id'],tid);self.assertEqual(lease['owner'],'user-1');self.assertEqual(lease['payload'],{'text':'hi'})
 def test_capability_filter(self):self.l.enqueue('echo','task','u',{});self.assertIsNone(self.l.lease_next('w',('other',)))
 def test_invalid_owner(self):
  with self.assertRaises(PayloadLedgerError):self.l.enqueue('echo','task','',{})
 def test_payload_bound(self):
  with self.assertRaises(PayloadLedgerError):self.l.enqueue('echo','task','u',{'s':'x'*17000})
 def test_non_json_payload(self):
  with self.assertRaises(PayloadLedgerError):self.l.enqueue('echo','task','u',{'x':object()})
 def test_persistence(self):
  tid=self.l.enqueue('echo','task','u',{'x':1});l2=PayloadPersistentTaskLedger(self.path,2,5);self.assertEqual(l2.lease_next('w',('echo',))['id'],tid)
 def test_queue_limit(self):
  self.l.enqueue('echo','1','u',{});self.l.enqueue('echo','2','u',{})
  with self.assertRaises(OverflowError):self.l.enqueue('echo','3','u',{})
if __name__=='__main__':unittest.main()
