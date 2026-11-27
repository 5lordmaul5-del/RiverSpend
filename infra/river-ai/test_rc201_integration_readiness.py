import unittest
from rc201_integration_readiness import MODULES,validate_map
class T(unittest.TestCase):
 def test_map_valid(self):self.assertTrue(validate_map()["valid"])
 def test_count(self):self.assertEqual(validate_map()["module_count"],19)
 def test_missing_dependency(self):self.assertFalse(validate_map([{"id":"X","depends":["Y"]}])["valid"])
if __name__=="__main__":unittest.main()
