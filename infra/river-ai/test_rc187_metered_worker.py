"""RC-187 composition mapping tests."""
import unittest
from rc187_metered_worker import metered_task_view,RC187CompositionError
class T(unittest.TestCase):
 def test_view(self):
  v=metered_task_view({"id":"1","payload":{"estimated_tokens":40,"x":1}})
  self.assertEqual(v["estimated_tokens"],40);self.assertEqual(v["work_payload"]["x"],1)
 def test_missing(self): self.assertRaises(RC187CompositionError,metered_task_view,{"id":"1","payload":{}})
 def test_bad_type(self): self.assertRaises(RC187CompositionError,metered_task_view,{"payload":{"estimated_tokens":True}})
if __name__=="__main__":unittest.main()
