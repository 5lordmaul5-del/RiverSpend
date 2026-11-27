import tempfile,unittest
from rc214_access_control import AccessController
class Tests(unittest.TestCase):
 def setup_ctrl(self):
  c=AccessController(); c.users["root"]="owner"; return c
 def test_role_assignment_and_denial(self):
  c=self.setup_ctrl(); c.assign_role("root","worker","agent")
  c.require("worker","memory:read")
  with self.assertRaises(PermissionError): c.require("worker","key:rotate")
 def test_rotation_metadata_and_revocation(self):
  c=self.setup_ctrl(); c.register_key("root","vault-key",1,"vault://ref/1")
  c.register_key("root","vault-key",2,"vault://ref/2")
  c.revoke_key("root","vault-key"); self.assertTrue(c.key_status("vault-key")["revoked"])
 def test_audit_access(self):
  c=self.setup_ctrl(); c.assign_role("root","readuser","reader")
  with self.assertRaises(PermissionError): c.audit_events("readuser")
  self.assertEqual(len(c.audit_events("root")),1)
 def test_version_monotonicity(self):
  c=self.setup_ctrl(); c.register_key("root","k",1,"ref")
  with self.assertRaises(ValueError): c.register_key("root","k",1,"ref2")
if __name__=="__main__": unittest.main()
