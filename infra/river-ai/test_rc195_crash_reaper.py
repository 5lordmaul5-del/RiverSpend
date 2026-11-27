import unittest
from rc195_crash_reaper import CrashReaper
class Tests(unittest.TestCase):
 def test_expired_requeued(self):
  t=[1.];r=CrashReaper(clock=lambda:t[0]);i=r.submit(max_attempts=3);r.claim(i,"a",2);t[0]=4
  self.assertEqual(r.reap()[0]["state"],"queued");self.assertEqual(r.get(i)[5],1)
 def test_exhausted_dead_letter(self):
  t=[1.];r=CrashReaper(clock=lambda:t[0]);i=r.submit(max_attempts=1);r.claim(i,"a",1);t[0]=3
  self.assertEqual(r.reap()[0]["state"],"dead_letter")
 def test_live_not_reaped(self):
  t=[1.];r=CrashReaper(clock=lambda:t[0]);i=r.submit();r.claim(i,"a",10);self.assertEqual(r.reap(),[])
 def test_owner_scoped_complete(self):
  r=CrashReaper();i=r.submit();r.claim(i,"a",20);self.assertFalse(r.complete(i,"b"));self.assertTrue(r.complete(i,"a"))
 def test_heartbeat_extend(self):
  t=[1.];r=CrashReaper(clock=lambda:t[0]);i=r.submit();r.claim(i,"a",2);t[0]=2;self.assertTrue(r.heartbeat(i,"a",5));t[0]=4;self.assertEqual(r.reap(),[])
if __name__=="__main__":unittest.main()
