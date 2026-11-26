import unittest
from rc161_sandbox_supervisor import SandboxSupervisor,SupervisorError
class Tests(unittest.TestCase):
 def setUp(self):self.s=SandboxSupervisor()
 def test_echo(self):self.assertEqual(self.s.run("echo",{"x":1}),{"echo":{"x":1}})
 def test_json(self):self.assertEqual(self.s.run("json_validate",{"json":"[]"}),{"valid":True})
 def test_metrics(self):self.assertEqual(self.s.run("metrics_report",{"total":3,"success":2,"failed":1})["total"],3)
 def test_unknown(self):
  with self.assertRaises(SupervisorError):self.s.run("shell",{"cmd":"x"})
 def test_payload_bound(self):
  with self.assertRaises(SupervisorError):self.s.run("echo",{"x":"a"*20000})
 def test_invalid_json_task(self):
  with self.assertRaises(SupervisorError):self.s.run("json_validate",{"json":"bad"})
if __name__=="__main__":unittest.main()
