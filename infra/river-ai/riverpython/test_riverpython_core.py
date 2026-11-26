import unittest
from riverpython_core import RiverPythonCore
class Tests(unittest.TestCase):
 def setUp(self):self.core=RiverPythonCore()
 def test_health(self):self.assertTrue(self.core.handle("health",{})["ok"])
 def test_echo(self):self.assertEqual(self.core.handle("echo",{"a":1})["payload"],{"a":1})
 def test_disallowed(self):self.assertFalse(self.core.handle("exec",{})["ok"])
 def test_payload_shape(self):self.assertFalse(self.core.handle("echo",[])["ok"])
 def test_validate(self):self.assertTrue(self.core.handle("validate_json",{"x":1})["valid"])
if __name__=="__main__":unittest.main()
