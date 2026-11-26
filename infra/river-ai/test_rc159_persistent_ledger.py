import tempfile, unittest, os, time
from rc159_persistent_ledger import PersistentTaskLedger

class LedgerTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.ledger=PersistentTaskLedger(os.path.join(self.tmp.name,'tasks.sqlite'),queue_limit=1,lease_seconds=1)
    def tearDown(self): self.tmp.cleanup()
    def test_persist_and_capacity(self):
        task=self.ledger.enqueue('test','summary')
        with self.assertRaises(OverflowError): self.ledger.enqueue('test','second')
        self.assertEqual(self.ledger.status()['queued'],1)
    def test_lease_and_owner_completion(self):
        tid=self.ledger.enqueue('test','summary')
        lease=self.ledger.lease_next('worker-A',('test',))
        self.assertEqual(lease['id'],tid)
        self.assertFalse(self.ledger.complete(tid,'worker-B'))
        self.assertTrue(self.ledger.complete(tid,'worker-A'))
        self.assertEqual(self.ledger.status()['completed'],1)
    def test_cancel(self):
        tid=self.ledger.enqueue('test','summary')
        self.assertTrue(self.ledger.cancel(tid))
        self.assertEqual(self.ledger.status()['cancelled'],1)
    def test_expired_lease_requeues(self):
        tid=self.ledger.enqueue('test','summary')
        self.ledger.lease_next('worker',('test',))
        time.sleep(1.05)
        lease=self.ledger.lease_next('worker2',('test',))
        self.assertEqual(lease['id'],tid)
        self.assertEqual(lease['attempts'],2)
    def test_capability_filter(self):
        self.ledger.enqueue('test','summary')
        self.assertIsNone(self.ledger.lease_next('worker',('other',)))

if __name__=='__main__': unittest.main()
