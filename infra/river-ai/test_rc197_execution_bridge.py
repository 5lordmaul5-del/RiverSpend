import unittest
from rc196_idempotency_registry import IdempotencyRegistry
from rc197_execution_bridge import ExecutionBridge

class BridgeTests(unittest.TestCase):
    def setUp(self):
        self.registry = IdempotencyRegistry()
    def tearDown(self):
        self.registry.close()

    def test_execute_and_replay_once(self):
        calls=[]
        bridge=ExecutionBridge(self.registry,lambda p:calls.append(p) or "ok")
        self.assertEqual(bridge.run("alice","k","payload")["status"],"completed")
        replay=bridge.run("alice","k","payload")
        self.assertEqual(replay["status"],"duplicate")
        self.assertEqual(replay["result"],"ok")
        self.assertEqual(calls,["payload"])

    def test_payload_conflict_same_owner(self):
        bridge=ExecutionBridge(self.registry,lambda p:"ok")
        bridge.run("alice","k","one")
        self.assertEqual(bridge.run("alice","k","two")["status"],"conflict")

    def test_key_isolated_between_owners(self):
        calls=[]
        bridge=ExecutionBridge(self.registry,lambda p:calls.append(p) or p)
        bridge.run("alice","same","a")
        second=bridge.run("bob","same","b")
        self.assertEqual(second["status"],"completed")
        self.assertEqual(calls,["a","b"])
        self.assertEqual(self.registry.get("alice","same")[6],"a")
        self.assertEqual(self.registry.get("bob","same")[6],"b")

    def test_processing_duplicate_does_not_execute(self):
        self.registry.begin("alice","k","p")
        calls=[]
        bridge=ExecutionBridge(self.registry,lambda p:calls.append(p) or "ok")
        self.assertEqual(bridge.run("alice","k","p")["state"],"processing")
        self.assertEqual(calls,[])

    def test_failure_sanitized_and_not_reexecuted(self):
        calls=[]
        def fail(p):
            calls.append(p)
            raise RuntimeError("secret details should not escape")
        bridge=ExecutionBridge(self.registry,fail)
        result=bridge.run("alice","k","p")
        self.assertEqual(result["status"],"failed")
        self.assertNotIn("secret details",str(result))
        replay=bridge.run("alice","k","p")
        self.assertEqual(replay["status"],"duplicate")
        self.assertEqual(replay["state"],"failed")
        self.assertEqual(calls,["p"])

    def test_non_string_result_records_failure(self):
        bridge=ExecutionBridge(self.registry,lambda p:{"unsafe":"object"})
        self.assertEqual(bridge.run("alice","k","p")["error_code"],"invalid_result")
        self.assertEqual(self.registry.get("alice","k")[3],"failed")

    def test_invalid_owner_rejected(self):
        bridge=ExecutionBridge(self.registry,lambda p:"ok")
        with self.assertRaises(ValueError):
            bridge.run("__legacy_migration__","k","p")

    def test_completion_state_changed_requires_reconciliation(self):
        class RaceRegistry:
            def begin(self,owner,key,payload): return {"status":"accepted"}
            def complete(self,owner,key,result): return False
            def fail(self,owner,key,error): return False
        bridge=ExecutionBridge(RaceRegistry(),lambda p:"side-effect")
        self.assertEqual(bridge.run("alice","k","p")["status"],"reconciliation_required")

if __name__ == "__main__":
    unittest.main()
