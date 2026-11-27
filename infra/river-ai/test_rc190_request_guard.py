import tempfile,os,unittest
from rc190_request_guard import RequestGuard
class Tests(unittest.TestCase):
 def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.g=RequestGuard(os.path.join(self.tmp.name,'g.sqlite'),window_seconds=10,max_requests=4,max_active=1,block_seconds=5,lease_seconds=3)
 def tearDown(self):self.tmp.cleanup()
 def test_rate_limit(self):
  a=self.g.acquire('u',100);self.assertTrue(a.allowed);self.g.release(a.lease_id,100);b=self.g.acquire('u',101);self.assertTrue(b.allowed);self.g.release(b.lease_id,101);self.assertEqual(self.g.acquire('u',102).reason,'rate_limit')
 def test_concurrency_and_release(self):
  a=self.g.acquire('u',100);self.assertEqual(self.g.acquire('u',100).reason,'concurrency_limit');self.assertTrue(self.g.release(a.lease_id,100));self.assertTrue(self.g.acquire('u',100).allowed)
 def test_window_reset(self):
  a=self.g.acquire('u',100);self.g.release(a.lease_id,100);b=self.g.acquire('u',101);self.g.release(b.lease_id,101);self.assertTrue(self.g.acquire('u',111).allowed)
 def test_invalid_subject(self):
  for s in ('',' leading','trailing ',None,123,'x'*257):self.assertEqual(self.g.acquire(s,100).reason,'invalid_subject')
 def test_block_expiry(self):
  a=self.g.acquire('u',100);self.g.release(a.lease_id,100);b=self.g.acquire('u',101);self.g.release(b.lease_id,101);d=self.g.acquire('u',102);self.assertEqual(d.reason,'rate_limit');self.assertTrue(self.g.acquire('u',107).allowed)
 def test_invalid_limits_clock(self):
  with self.assertRaises(ValueError):RequestGuard(':memory:',max_active=0)
  self.assertEqual(self.g.acquire('u',100.5).reason,'invalid_time')
 def test_expired_lease_reaped_on_acquire(self):
  a=self.g.acquire('u',100);self.assertEqual(self.g.acquire('u',102).reason,'concurrency_limit');b=self.g.acquire('u',103);self.assertTrue(b.allowed);self.assertNotEqual(a.lease_id,b.lease_id)
 def test_reaper_and_idempotent_release(self):
  a=self.g.acquire('u',100);self.assertEqual(self.g.reap_expired(103),1);self.assertFalse(self.g.release(a.lease_id,103));b=self.g.acquire('u',103);self.assertTrue(self.g.release(b.lease_id,103));self.assertFalse(self.g.release(b.lease_id,103))
if __name__=='__main__':unittest.main()
