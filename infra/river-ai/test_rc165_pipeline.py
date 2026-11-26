import unittest
from rc165_pipeline import RC165Pipeline
class L:
 def __init__(self,x):self.x=x;self.completed=[];self.failed=[]
 def lease_next(self,w,c):return self.x
 def complete(self,t,w,r):self.completed.append(r)
 def fail(self,t,w,e):self.failed.append(e)
class P:
 def authorize(self,k,o,cost=1):return "token"
 def finish(self,t,ok):pass
 def refund(self,t):pass
class E:
 def execute(self,k,p):return {"ok":True}
class Tests(unittest.TestCase):
 def test_idle(self):self.assertEqual(RC165Pipeline(L(None),P(),E(),"w",{"echo"}).run_once()["status"],"idle")
 def test_success(self):
  l=L({"task_id":"t","kind":"echo","owner":"o","payload":{}})
  self.assertEqual(RC165Pipeline(l,P(),E(),"w",{"echo"}).run_once()["status"],"completed");self.assertEqual(len(l.completed),1)
 def test_reject_capability(self):
  l=L({"task_id":"t","kind":"other","owner":"o","payload":{}})
  self.assertEqual(RC165Pipeline(l,P(),E(),"w",{"echo"}).run_once()["status"],"rejected")
 def test_fail_closed(self):
  class Bad:
   def execute(self,k,p):raise ValueError()
  l=L({"task_id":"t","kind":"echo","owner":"o","payload":{}})
  self.assertEqual(RC165Pipeline(l,P(),Bad(),"w",{"echo"}).run_once()["status"],"failed");self.assertTrue(l.failed)
if __name__=="__main__":unittest.main()
