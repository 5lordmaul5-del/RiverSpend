import unittest
from rc160_rsworker_engine import RSWorkerEngine, WorkerError
class Tests(unittest.TestCase):
 def test_echo(self):
  e=RSWorkerEngine();e.submit("echo",{"a":1});o=e.run_one("w",{"echo"});self.assertEqual(o["status"],"completed")
 def test_capability(self):
  e=RSWorkerEngine();e.submit("echo",{});self.assertIsNone(e.run_one("w",{"other"}))
 def test_queue_limit(self):
  e=RSWorkerEngine(max_queue=1);e.submit("echo",{})
  with self.assertRaises(WorkerError):e.submit("echo",{})
 def test_cancel(self):
  e=RSWorkerEngine();i=e.submit("echo",{});self.assertTrue(e.cancel(i));self.assertFalse(e.cancel(i))
 def test_json(self):
  e=RSWorkerEngine();e.submit("json_validate",{"json":"{}"});self.assertEqual(e.run_one("w",{"json_validate"})["status"],"completed")
 def test_metrics_fail(self):
  e=RSWorkerEngine();e.submit("metrics_report",{"total":1,"success":2,"failed":0});self.assertEqual(e.run_one("w",{"metrics_report"})["status"],"failed")
 def test_bounds(self):
  e=RSWorkerEngine()
  with self.assertRaises(WorkerError):e.submit("echo",{"s":"x"*17000})
 def test_unknown(self):
  e=RSWorkerEngine()
  with self.assertRaises(WorkerError):e.submit("shell",{})
 def test_status(self):
  e=RSWorkerEngine();e.submit("echo",{});e.run_one("w",{"echo"});self.assertEqual(e.status()["completed"],1)
if __name__=="__main__":unittest.main()
