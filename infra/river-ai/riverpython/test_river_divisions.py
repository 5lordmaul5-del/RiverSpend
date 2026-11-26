import unittest
from river_divisions import DIVISIONS,list_divisions,get_division
class Tests(unittest.TestCase):
 def test_registry_nonempty(self):self.assertGreaterEqual(len(DIVISIONS),15)
 def test_names_unique(self):self.assertEqual(len({v["name"] for v in DIVISIONS.values()}),len(DIVISIONS))
 def test_teams_present(self):self.assertTrue(all(v["teams"] for v in DIVISIONS.values()))
 def test_lookup(self):self.assertEqual(get_division("robotics")["name"],"RiverRobotics")
 def test_listing(self):self.assertEqual(len(list_divisions()),len(DIVISIONS))
if __name__=="__main__":unittest.main()
