import tempfile,os,unittest
from rc191_leased_slots import LeaseSlots
class Tests(unittest.TestCase):
 def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.l=LeaseSlots(os.path.join(self.tmp.name,"l.sqlite"),1,10)
 def tearDown(self):self.tmp.cleanup()
 def test_slot_and_release(self):
  a=self.l.acquire("u",100);self.assertTrue(a.allowed);self.assertEqual(self.l.acquire("u",101).reason,"concurrency_limit")
  self.assertTrue(self.l.release(a.lease.lease_id,"u",101));self.assertTrue(self.l.acquire("u",101).allowed)
 def test_expiry_reclaims(self):
  a=self.l.acquire("u",100);b=self.l.acquire("u",110);self.assertTrue(b.allowed)
 def test_heartbeat_extends(self):
  a=self.l.acquire("u",100);h=self.l.heartbeat(a.lease.lease_id,"u",105)
  self.assertEqual(h.expires_at,115);self.assertFalse(self.l.release(a.lease.lease_id,"u",116))
 def test_wrong_subject_cannot_release_or_heartbeat(self):
  a=self.l.acquire("u",100);self.assertFalse(self.l.release(a.lease.lease_id,"x",101));self.assertIsNone(self.l.heartbeat(a.lease.lease_id,"x",101))
 def test_expired_heartbeat_rejected(self):
  a=self.l.acquire("u",100);self.assertIsNone(self.l.heartbeat(a.lease.lease_id,"u",110))
if __name__=="__main__":unittest.main()
