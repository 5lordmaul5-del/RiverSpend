import tempfile,os,unittest
from rc190_request_guard import RequestGuard
class Tests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.g=RequestGuard(os.path.join(self.tmp.name,"g.sqlite"),window_seconds=10,max_requests=2,max_active=1,block_seconds=5)
 def tearDown(self):self.tmp.cleanup()
 def test_rate_limit(self):
  self.assertTrue(self.g.acquire("u",100).allowed);self.g.release("u")
  self.assertTrue(self.g.acquire("u",101).allowed);self.g.release("u")
  self.assertEqual(self.g.acquire("u",102).reason,"rate_limit")
 def test_concurrency_and_release(self):
  self.assertTrue(self.g.acquire("u",100).allowed)
  self.assertEqual(self.g.acquire("u",100).reason,"concurrency_limit")
  self.assertTrue(self.g.release("u"));self.assertTrue(self.g.acquire("u",100).allowed)
 def test_window_reset(self):
  self.g.acquire("u",100);self.g.release("u");self.g.acquire("u",101);self.g.release("u")
  self.assertTrue(self.g.acquire("u",111).allowed)
 def test_invalid_subject(self):self.assertFalse(self.g.acquire("",100).allowed)
 def test_block_expiry(self):
  self.g.acquire("u",100);self.g.release("u");self.g.acquire("u",101);self.g.release("u")
  d=self.g.acquire("u",102);self.assertEqual(d.reason,"rate_limit")
  self.assertTrue(self.g.acquire("u",107).allowed)
if __name__=="__main__":unittest.main()
