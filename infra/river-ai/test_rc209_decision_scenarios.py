import unittest
from rc209_decision_scenarios import Scenario,evaluate,compare
class TestRC209(unittest.TestCase):
 def test_net(self): self.assertEqual(evaluate(Scenario("x","X",10,30))["net_estimate"],20)
 def test_invalid_cost(self):
  with self.assertRaises(ValueError):evaluate(Scenario("x","X",-1,2))
 def test_rank(self):
  a=compare([Scenario("a","A",10,20,5),Scenario("b","B",10,25,8)])
  self.assertEqual(a["scenarios"][0]["scenario_id"],"b")
 def test_zero_cost_ratio(self): self.assertIsNone(evaluate(Scenario("x","X",0,3))["benefit_cost_ratio"])
if __name__=="__main__":unittest.main()
