import unittest
from rc172_quality_gates import evaluate_gate_status, GATES
class GateTests(unittest.TestCase):
 def test_all(self): self.assertTrue(evaluate_gate_status({g:True for g in GATES})["ready"])
 def test_missing(self): self.assertEqual(len(evaluate_gate_status({})["missing"]),len(GATES))
 def test_unknown(self):
  with self.assertRaises(ValueError): evaluate_gate_status({"deploy":True})
 def test_non_bool(self):
  with self.assertRaises(TypeError): evaluate_gate_status({"tests":1})
 def test_partial_not_ready(self): self.assertFalse(evaluate_gate_status({"tests":True})["ready"])
if __name__ == "__main__": unittest.main()
