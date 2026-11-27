import unittest
from rc205_data_pipeline import normalize_record,batch_normalize,assess_series

class PipelineTests(unittest.TestCase):
 def record(self,**kw):
  d={"source":"fixture","observed_at":"2026-11-27T12:00:00Z","metric":"Price","value":3.5,"unit":"EUR"}
  d.update(kw);return d
 def test_normalizes_time_and_metric(self):
  r=normalize_record(self.record());self.assertTrue(r["observed_at"].endswith("+00:00"));self.assertEqual(r["metric"],"price")
 def test_hash_stable(self):
  self.assertEqual(normalize_record(self.record())["record_hash"],normalize_record(self.record())["record_hash"])
 def test_timezone_required(self):
  with self.assertRaises(ValueError): normalize_record(self.record(observed_at="2026-11-27T12:00:00"))
 def test_batch_rejects_bad_record(self):
  out=batch_normalize([self.record(),{"bad":1}]);self.assertEqual(out["counts"],{"accepted":1,"rejected":1})
 def test_quality_duplicate(self):
  out=assess_series([self.record(),self.record()]);self.assertIn("duplicate_records",out["quality_flags"])
 def test_numeric_value(self):
  with self.assertRaises(ValueError): normalize_record(self.record(value="3"))
if __name__=="__main__": unittest.main()
