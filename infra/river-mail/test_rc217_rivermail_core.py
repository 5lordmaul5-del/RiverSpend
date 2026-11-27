import tempfile,unittest,os
from rc217_rivermail_core import RiverMailCore
class T(unittest.TestCase):
 def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.c=RiverMailCore(os.path.join(self.tmp.name,"m.db"))
 def tearDown(self):self.tmp.cleanup()
 def test_mail(self):
  mid=self.c.receive_demo("a","b","a","Hi","Body");self.assertEqual(len(self.c.list_messages("a")),1);self.assertTrue(self.c.mark_read(mid))
 def test_search(self):self.c.receive_demo("a","b","a","Order","tracking");self.assertEqual(len(self.c.search("a","tracking")),1)
 def test_bridge(self):
  self.c.integration_notification("RiverSpendShop","order","a","Order","Demo","ref");self.assertEqual(self.c.list_messages("a")[0]["source_app"],"RiverSpendShop")
  with self.assertRaises(ValueError):self.c.integration_notification("Other","x","a","x","y")
 def test_queue(self):
  eid=self.c.emit_event("demo",{"x":1});self.assertEqual(len(self.c.pending_events()),1);self.assertTrue(self.c.mark_event_processed(eid));self.assertEqual(len(self.c.pending_events()),0)
if __name__=="__main__":unittest.main()
