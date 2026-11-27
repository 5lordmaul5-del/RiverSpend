import unittest
from rc214_key_registry import KeyAccessRegistry
class Tests(unittest.TestCase):
 def test_admin_grant_and_role_authorize(self):
  r=KeyAccessRegistry(); k=r.create_record("memory backup","admin")
  r.grant(k.key_id,"agent","admin")
  self.assertTrue(r.authorize(k.key_id,"agent"))
  self.assertFalse(r.authorize(k.key_id,"viewer"))
 def test_admin_only(self):
  r=KeyAccessRegistry(); k=r.create_record("x","admin")
  with self.assertRaises(PermissionError): r.grant(k.key_id,"viewer","agent")
  with self.assertRaises(PermissionError): r.create_record("x","viewer")
 def test_revoke(self):
  r=KeyAccessRegistry(); k=r.create_record("x","admin")
  r.grant(k.key_id,"operator","admin"); r.revoke(k.key_id,"operator","admin")
  self.assertFalse(r.authorize(k.key_id,"operator"))
 def test_deactivate(self):
  r=KeyAccessRegistry(); k=r.create_record("x","admin")
  r.grant(k.key_id,"agent","admin"); r.deactivate(k.key_id,"admin")
  self.assertFalse(r.authorize(k.key_id,"agent"))
 def test_audit(self):
  r=KeyAccessRegistry(); k=r.create_record("x","admin"); r.authorize(k.key_id,"viewer")
  self.assertEqual(r.audit_log()[-1]["result"],"deny")
if __name__=="__main__": unittest.main()
