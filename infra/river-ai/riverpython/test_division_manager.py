import unittest
from division_manager import DivisionManager
class Tests(unittest.TestCase):
 def setUp(self):self.m=DivisionManager()
 def test_assign(self):self.assertTrue(self.m.assign("games","Build a prototype")["ok"])
 def test_unknown(self):self.assertFalse(self.m.assign("unknown","x")["ok"])
 def test_bad_description(self):self.assertFalse(self.m.assign("games","")["ok"])
 def test_priority_sort(self):
  self.m.assign("games","a","low");self.m.assign("audio","b","urgent");self.assertEqual(self.m.list_tasks()[0]["priority"],"urgent")
 def test_status(self):
  t=self.m.assign("games","test")["task"];self.assertTrue(self.m.update_status(t["id"],"in_progress")["ok"])
 def test_missing(self):self.assertFalse(self.m.update_status("x","completed")["ok"])
if __name__=="__main__":unittest.main()
