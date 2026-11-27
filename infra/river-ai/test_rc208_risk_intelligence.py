import unittest
from rc208_risk_intelligence import Risk,assess,portfolio
class Tests(unittest.TestCase):
 def test_score_and_level(self):
  x=assess(Risk("x","desc",5,5));self.assertEqual(x["score"],25);self.assertEqual(x["level"],"critical")
 def test_invalid(self):
  with self.assertRaises(ValueError):assess(Risk("x","desc",0,5))
 def test_order_and_counts(self):
  p=portfolio([Risk("a","",1,1),Risk("b","",4,4)])
  self.assertEqual(p["assessments"][0]["risk_id"],"b");self.assertEqual(p["counts"]["high"],1)
if __name__=="__main__":unittest.main()
