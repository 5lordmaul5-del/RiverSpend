import unittest, tempfile, os
from rc184_usage_ledger import UsageLedger, UsageLedgerError

class RC184Tests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.ledger=UsageLedger(os.path.join(self.tmp.name,"usage.db"))
    def tearDown(self): self.tmp.cleanup()

    def test_record_and_sum(self):
        self.ledger.record("u1","free","2026-11","r1",12)
        self.ledger.record("u1","free","2026-11","r2",8)
        self.assertEqual(self.ledger.total("u1","2026-11"),20)
        self.assertEqual(self.ledger.event_count("u1","2026-11"),2)
    def test_scoped_by_user_and_period(self):
        self.ledger.record("u1","free","a","r1",10)
        self.ledger.record("u2","free","a","r2",20)
        self.ledger.record("u1","free","b","r3",30)
        self.assertEqual(self.ledger.total("u1","a"),10)
    def test_duplicate_idempotency_rejected(self):
        self.ledger.record("u1","free","a","r1",10)
        with self.assertRaises(UsageLedgerError): self.ledger.record("u1","free","a","r1",10)
        self.assertEqual(self.ledger.total("u1","a"),10)
    def test_input_validation(self):
        for invalid in (-1, True, "2"):
            with self.assertRaises(UsageLedgerError): self.ledger.record("u1","free","a","r",invalid)
        with self.assertRaises(UsageLedgerError): self.ledger.record("","","","",0)
    def test_persistence_across_instances(self):
        self.ledger.record("u1","pro","a","r1",50)
        second=UsageLedger(os.path.join(self.tmp.name,"usage.db"))
        self.assertEqual(second.total("u1","a"),50)

if __name__=="__main__": unittest.main()
