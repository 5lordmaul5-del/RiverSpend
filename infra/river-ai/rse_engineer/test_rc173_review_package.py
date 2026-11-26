import unittest
from rc173_review_package import build_review_package, GATES
class PackageTests(unittest.TestCase):
 def test_empty_safe_package(self):
  p=build_review_package("change", "safe")
  self.assertFalse(p["ready_for_human_review"])
 def test_gates_and_clean_text(self):
  p=build_review_package("change", "safe", {g:True for g in GATES})
  self.assertTrue(p["ready_for_human_review"])
 def test_finding_blocks_ready(self):
  p=build_review_package("change", "eval(foo)", {g:True for g in GATES})
  self.assertFalse(p["ready_for_human_review"])
 def test_bad_gate(self):
  with self.assertRaises(ValueError): build_review_package("change","safe",{"deploy":True})
 def test_text_limit(self):
  with self.assertRaises(ValueError): build_review_package("change","x"*100001)
if __name__ == "__main__": unittest.main()
