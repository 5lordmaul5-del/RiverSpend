import unittest
from rc207_data_quality import analyze
class TestRC207(unittest.TestCase):
 def test_missing_and_duplicate(self):
  out=analyze([{"id":"a","value":1},{"id":"a","value":2},{"value":3},{"id":"b"}])
  names=[f for x in out["flagged_records"] for f in x["flags"]]
  self.assertIn("duplicate_id",names); self.assertIn("missing_id",names); self.assertIn("missing_metric",names)
 def test_outlier(self):
  out=analyze([{"id":str(i),"value":v} for i,v in enumerate([10,11,10,12,1000])])
  self.assertTrue(any("robust_outlier" in x["flags"] for x in out["flagged_records"]))
 def test_change(self):
  out=analyze([{"id":"1","value":1},{"id":"2","value":10}],jump_threshold=3)
  self.assertEqual(len(out["large_sequential_changes"]),1)
 def test_type(self):
  out=analyze([{"id":"x","value":"oops"}])
  self.assertIn("metric_not_numeric",out["flagged_records"][0]["flags"])
if __name__=="__main__": unittest.main()
