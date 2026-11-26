import unittest
from rse_engineer_core import create_task

class IntakeTests(unittest.TestCase):
    def test_valid_task(self):
        t = create_task("bug", "Fix queue", "Investigate queue stall", "high")
        self.assertEqual(t.status, "queued")
        self.assertTrue(t.approval_required)
        self.assertEqual(t.task_type, "bug")
    def test_invalid_type(self):
        with self.assertRaises(ValueError): create_task("deploy", "x", "y")
    def test_invalid_priority(self):
        with self.assertRaises(ValueError): create_task("bug", "x", "y", "urgent-ish")
    def test_blank_title(self):
        with self.assertRaises(ValueError): create_task("bug", "  ", "description")
    def test_description_limit(self):
        with self.assertRaises(ValueError): create_task("bug", "title", "x" * 4001)
    def test_approval_type(self):
        with self.assertRaises(ValueError): create_task("bug", "title", "description", approval_required=1)

if __name__ == "__main__": unittest.main()
