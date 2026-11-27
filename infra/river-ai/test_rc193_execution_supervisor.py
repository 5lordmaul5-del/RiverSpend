import unittest
from rc193_execution_supervisor import ExecutionSupervisor
class Tests(unittest.TestCase):
 def test_lifecycle(self):
  t=[10.];s=ExecutionSupervisor(clock=lambda:t[0]);i=s.start("w",10)
  self.assertTrue(s.heartbeat(i,"w"));self.assertTrue(s.finish(i,"w"));self.assertEqual(s.get(i)[2],"completed")
 def test_timeout(self):
  t=[10.];s=ExecutionSupervisor(clock=lambda:t[0]);i=s.start("w",2);t[0]=13
  self.assertEqual(s.scan()[0]["action"],"expired")
 def test_missing_heartbeat(self):
  t=[10.];s=ExecutionSupervisor(clock=lambda:t[0]);i=s.start("w",100);t[0]=50
  self.assertEqual(s.scan()[0]["action"],"heartbeat_missing")
 def test_owner(self):
  t=[10.];s=ExecutionSupervisor(clock=lambda:t[0]);i=s.start("w",20)
  self.assertFalse(s.heartbeat(i,"bad"));self.assertTrue(s.heartbeat(i,"w"))
if __name__=="__main__":unittest.main()
