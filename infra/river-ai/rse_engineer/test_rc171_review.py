import unittest
from rc171_review import review_text, summarize

class ReviewTests(unittest.TestCase):
 def test_empty(self): self.assertEqual(review_text("safe text"), [])
 def test_secret_marker(self): self.assertEqual(review_text("ghp_example")[0].severity, "high")
 def test_eval_marker(self): self.assertEqual(review_text("eval(foo)")[0].rule, "unsafe-execution")
 def test_summary_review(self): self.assertTrue(summarize(review_text("requests.get("))["review_required"])
 def test_type(self):
  with self.assertRaises(TypeError): review_text(None)
if __name__ == "__main__": unittest.main()
