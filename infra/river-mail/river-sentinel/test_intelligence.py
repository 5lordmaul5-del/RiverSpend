import unittest
from intelligence import analyze

class IntelligenceTests(unittest.TestCase):
 def test_invalid_event_ignored(self):
  self.assertEqual(analyze([{}, {"user_key":"x","kind":"unknown"}]),[])
 def test_login_cluster(self):
  r=analyze([{"user_key":"u","kind":"new_device"},{"user_key":"u","kind":"login_burst"}])[0]
  self.assertIn("login_anomaly_cluster",r["correlations"])
  self.assertEqual(r["level"],"orange")
 def test_forwarding_oauth_cluster(self):
  r=analyze([{"user_key":"u","kind":"forwarding_rule"},{"user_key":"u","kind":"oauth_grant"}])[0]
  self.assertIn("account_persistence_cluster",r["correlations"])
  self.assertEqual(r["score"],80)
  self.assertEqual(r["level"],"red")
 def test_separate_users(self):
  r=analyze([{"user_key":"a","kind":"new_device"},{"user_key":"b","kind":"forwarding_rule"}])
  self.assertEqual(len(r),2)
if __name__=="__main__": unittest.main()
