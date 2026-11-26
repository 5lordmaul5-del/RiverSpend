import unittest
from rc163_ledger_worker_adapter import RC163Adapter
class FakeLedger:
 def __init__(self,lease):self.lease=lease;self.done=[];self.failed=[]
 def lease_next(self,w,c):return self.lease
 def complete(self,t,w,r):self.done.append((t,w,r))
 def fail(self,t,w,e):self.failed.append((t,w,e))
class FakeSupervisor:
 def run(self,k,p):return {"result":"ok"}
class FakePolicy:
 def __init__(self):self.authorized=[];self.refunds=[];self.finished=[]
 def authorize(self,k,o,cost=1):self.authorized.append((k,o,cost));return "p1"
 def finish(self,p,s):self.finished.append((p,s))
 def refund(self,p):self.refunds.append(p)
class Tests(unittest.TestCase):
 def make(self,lease):
  l=FakeLedger(lease);p=FakePolicy();a=RC163Adapter(l,FakeSupervisor(),p,"worker-a",{"echo"});return a,l,p
 def test_complete_path(self):
  a,l,p=self.make({"task_id":"1","kind":"echo","owner":"x","payload":{}})
  self.assertEqual(a.step()["status"],"completed");self.assertEqual(len(l.done),1);self.assertEqual(len(p.finished),1)
 def test_idle(self):
  a,l,p=self.make(None);self.assertEqual(a.step()["status"],"idle")
 def test_bad_lease(self):
  a,l,p=self.make({"task_id":"1","kind":"other","owner":"x","payload":{}});self.assertEqual(a.step()["status"],"rejected")
 def test_fail_path(self):
  class Broken: 
   def run(self,k,p):raise RuntimeError()
  l=FakeLedger({"task_id":"1","kind":"echo","owner":"x","payload":{}});p=FakePolicy()
  a=RC163Adapter(l,Broken(),p,"w",{"echo"});self.assertEqual(a.step()["status"],"failed");self.assertEqual(l.failed[0][2],"worker_failed")
if __name__=="__main__":unittest.main()
