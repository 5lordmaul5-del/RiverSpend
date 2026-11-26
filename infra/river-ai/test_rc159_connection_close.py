import os
import tempfile
import unittest
from unittest.mock import patch
import rc159_persistent_ledger as module

class ConnectionProxy:
    def __init__(self, conn): self.conn=conn; self.closed=False
    def execute(self,*args,**kwargs): return self.conn.execute(*args,**kwargs)
    def commit(self): return self.conn.commit()
    def rollback(self): return self.conn.rollback()
    def close(self): self.closed=True; return self.conn.close()
    def __enter__(self): return self
    def __exit__(self, exc_type, exc, tb):
        if exc_type: self.rollback()
        else: self.commit()
        self.close()

class ConnectionCloseTests(unittest.TestCase):
    def test_every_db_context_closes_connection(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=os.path.join(tmp,'ledger.sqlite')
            original=module.sqlite3.connect
            opened=[]
            def tracked_connect(*args,**kwargs):
                proxy=ConnectionProxy(original(*args,**kwargs));opened.append(proxy);return proxy
            with patch.object(module.sqlite3,'connect',tracked_connect):
                ledger=module.PersistentTaskLedger(path)
                ledger.enqueue('test','summary')
                ledger.status()
                ledger.lease_next('worker',('test',))
                ledger.status()
            self.assertGreaterEqual(len(opened),4)
            self.assertTrue(all(c.closed for c in opened), 'all ledger connections should close deterministically')

if __name__=='__main__': unittest.main()
