"""RC-185 unit tests."""
import tempfile,unittest,threading
from rc185_atomic_quota import AtomicQuota,QuotaReservationError
class T(unittest.TestCase):
 def setUp(self): self.tmp=tempfile.TemporaryDirectory(); self.q=AtomicQuota(self.tmp.name+"/db.sqlite")
 def tearDown(self): self.tmp.cleanup()
 def test_reserve_commit_usage(self):
  self.assertTrue(self.q.reserve("a","u","free","m",80,100)); self.assertFalse(self.q.reserve("b","u","free","m",30,100)); self.q.commit("a","req",70); self.assertTrue(self.q.reserve("b","u","free","m",30,100))
 def test_release(self): self.q.reserve("a","u","free","m",90,100); self.q.release("a"); self.assertTrue(self.q.reserve("b","u","free","m",90,100))
 def test_idempotent(self): self.assertTrue(self.q.reserve("a","u","free","m",20,100)); self.assertTrue(self.q.reserve("a","u","free","m",20,100))
 def test_mismatch(self): self.q.reserve("a","u","free","m",20,100); self.assertRaises(QuotaReservationError,self.q.reserve,"a","other","free","m",20,100)
 def test_concurrent(self):
  out=[]; ts=[threading.Thread(target=lambda i=i:out.append(self.q.reserve(str(i),"u","free","m",60,100))) for i in range(2)]
  [t.start() for t in ts]; [t.join() for t in ts]; self.assertEqual(sum(out),1)
 def test_validation(self): self.assertRaises(QuotaReservationError,self.q.reserve,"a","u","p","m",True,100)
 def test_release_commit_denied(self): self.q.reserve("a","u","p","m",20,100); self.q.release("a"); self.assertRaises(QuotaReservationError,self.q.commit,"a","req")
if __name__=="__main__":unittest.main()
