import unittest
from rc180_contract_bridge import bind_lease, ContractError

class BridgeTests(unittest.TestCase):
    def setUp(self):
        self.lease={"id":"t1","capability":"echo","summary":"bounded task",
                    "lease_owner":"worker-a","attempts":1}
        self.envelope={"worker_id":"worker-a","kind":"echo","owner":"user-1",
                       "payload":{"message":"hello"}}

    def test_bind_valid_contract(self):
        out=bind_lease(self.lease,self.envelope)
        self.assertEqual(out["task_id"],"t1")
        self.assertEqual(out["kind"],"echo")
        self.assertEqual(out["payload"],{"message":"hello"})

    def test_worker_mismatch_fails_closed(self):
        e=dict(self.envelope,worker_id="worker-b")
        with self.assertRaises(ContractError): bind_lease(self.lease,e)

    def test_capability_mismatch_fails_closed(self):
        e=dict(self.envelope,kind="shell")
        with self.assertRaises(ContractError): bind_lease(self.lease,e)

    def test_missing_payload_fails_closed(self):
        e=dict(self.envelope);e.pop("payload")
        with self.assertRaises(ContractError): bind_lease(self.lease,e)

    def test_missing_owner_fails_closed(self):
        e=dict(self.envelope,owner="")
        with self.assertRaises(ContractError): bind_lease(self.lease,e)

    def test_invalid_lease_fails_closed(self):
        l=dict(self.lease);l.pop("id")
        with self.assertRaises(ContractError): bind_lease(l,self.envelope)

if __name__=="__main__": unittest.main()
