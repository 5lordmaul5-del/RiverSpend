import tempfile,os,unittest
from rc218_rivermail_plans import RiverMailPlans
class T(unittest.TestCase):
 def setUp(self):self.t=tempfile.TemporaryDirectory();self.c=RiverMailPlans(os.path.join(self.t.name,"db"))
 def tearDown(self):self.t.cleanup()
 def test_account_and_usage(self):
  self.c.create_account("u");self.assertEqual(self.c.account("u")["plan"],"free");self.assertTrue(self.c.record_usage("u",123));self.assertEqual(self.c.account("u")["used_bytes"],123)
 def test_change_plan(self):
  self.c.create_account("u");self.assertTrue(self.c.change_plan("u","plus"));self.assertFalse(self.c.account("u")["plan_details"]["sponsorship"])
 def test_campaign(self):
  cid=self.c.create_campaign("Campaign","Advertiser");self.assertEqual(len(self.c.campaigns()),1);self.assertEqual(self.c.campaigns()[0]["label"],"Sponsored")
if __name__=="__main__":unittest.main()
