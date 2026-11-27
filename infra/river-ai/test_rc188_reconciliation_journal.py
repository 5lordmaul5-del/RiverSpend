import tempfile, unittest, os
from rc188_reconciliation_journal import ReconciliationJournal

class JournalTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.j=ReconciliationJournal(os.path.join(self.tmp.name,"ops.sqlite"))
    def tearDown(self): self.tmp.cleanup()
    def test_reserve_is_idempotent_and_conflict_checked(self):
        a=self.j.reserve("a",100); b=self.j.reserve("a",100)
        self.assertEqual(a,b)
        with self.assertRaises(ValueError): self.j.reserve("a",101)
    def test_execution_and_reconciliation_idempotent(self):
        self.j.reserve("x",100)
        a=self.j.mark_executed("x",80,{"ok":True})
        b=self.j.mark_executed("x",80,{"ok":True})
        self.assertEqual(a,b)
        self.assertEqual(self.j.reconcile("x").state,"reconciled")
        self.assertEqual(self.j.reconcile("x").state,"reconciled")
    def test_conflicting_retry_rejected(self):
        self.j.reserve("x",100); self.j.mark_executed("x",80,{"ok":True})
        with self.assertRaises(ValueError): self.j.mark_executed("x",81,{"ok":True})
    def test_reserved_can_fail_and_failure_idempotent(self):
        self.j.reserve("x",20)
        self.assertEqual(self.j.fail("x").state,"failed")
        self.assertEqual(self.j.fail("x").state,"failed")
    def test_pending_surfaces_unfinished(self):
        self.j.reserve("a",10); self.j.reserve("b",10); self.j.mark_executed("b",8)
        self.assertEqual([r.operation_id for r in self.j.pending()],["a","b"])
    def test_cannot_reconcile_unexecuted(self):
        self.j.reserve("x",10)
        with self.assertRaises(ValueError): self.j.reconcile("x")

if __name__ == "__main__": unittest.main()
