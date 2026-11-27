import unittest
from rc196_idempotency_registry import IdempotencyRegistry
from rc197_execution_bridge import ExecutionBridge
class T(unittest.TestCase):
 def test_exec_and_repeat(self):
  calls=[];b=ExecutionBridge(IdempotencyRegistry(),lambda p:calls.append(p) or "ok")
  self.assertEqual(b.run("a","payload")["status"],"completed")
  self.assertEqual(b.run("a","payload")["status"],"duplicate")
  self.assertEqual(len(calls),1)
 def test_payload_conflict(self):
  b=ExecutionBridge(IdempotencyRegistry(),lambda p:"ok");b.run("a","x")
  self.assertEqual(b.run("a","y")["status"],"conflict")
 def test_exception(self):
  b=ExecutionBridge(IdempotencyRegistry(),lambda p:1/0)
  self.assertEqual(b.run("a","x")["status"],"failed")
if __name__=="__main__":unittest.main()
