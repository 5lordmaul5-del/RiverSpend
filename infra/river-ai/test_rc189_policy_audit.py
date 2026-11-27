import tempfile,os,unittest
from rc189_policy_audit import Principal,Policy,AuditLog,authorize_and_audit

class Tests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory(); self.log=AuditLog(os.path.join(self.tmp.name,"a.sqlite"))
  self.p=Policy({"user":{"chat","read"},"admin":{"chat","read","manage"}})
 def tearDown(self): self.tmp.cleanup()
 def test_authorized(self):
  d=authorize_and_audit(self.p,self.log,Principal("u1",("user",),True),"e1","chat")
  self.assertTrue(d.allowed)
  self.assertEqual(self.log.events("u1")[0]["decision"],"allowed")
 def test_denied_permission_audited(self):
  d=authorize_and_audit(self.p,self.log,Principal("u1",("user",),True),"e2","manage")
  self.assertFalse(d.allowed); self.assertEqual(self.log.events("u1")[0]["decision"],"denied")
 def test_fail_closed(self):
  for principal in (None,Principal("u1",("user",),False),Principal("",("admin",),True)):
   self.assertFalse(self.p.authorize(principal,"chat").allowed)
 def test_unknown_role_and_action_denied(self):
  self.assertFalse(self.p.authorize(Principal("u",("unknown",),True),"chat").allowed)
  self.assertFalse(self.p.authorize(Principal("u",("admin",),True),"__danger").allowed)
 def test_audit_duplicate_id_ignored(self):
  self.log.record("e","u","chat","allowed")
  self.log.record("e","u","chat","denied")
  self.assertEqual(len(self.log.events()),1)

if __name__=="__main__":unittest.main()
