import unittest
from rc196_idempotency_registry import IdempotencyRegistry
class Tests(unittest.TestCase):
 def test_first_and_duplicate(self):
  r=IdempotencyRegistry();self.assertEqual(r.begin("k","p")["status"],"accepted");self.assertEqual(r.begin("k","p")["status"],"duplicate")
 def test_payload_conflict(self):
  r=IdempotencyRegistry();r.begin("k","one");self.assertEqual(r.begin("k","two")["status"],"conflict")
 def test_complete_replays_result(self):
  r=IdempotencyRegistry();r.begin("k","p");self.assertTrue(r.complete("k","done"));self.assertEqual(r.begin("k","p")["result"],"done")
 def test_fail_state(self):
  r=IdempotencyRegistry();r.begin("k","p");self.assertTrue(r.fail("k","oops"));self.assertEqual(r.get("k")[2],"failed")
 def test_only_processing_can_complete(self):
  r=IdempotencyRegistry();r.begin("k","p");r.complete("k","ok");self.assertFalse(r.complete("k","again"))
if __name__=="__main__":unittest.main()
