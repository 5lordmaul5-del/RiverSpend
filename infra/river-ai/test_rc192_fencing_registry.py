import unittest
from rc192_fencing_registry import FenceRegistry

class RC192Tests(unittest.TestCase):
    def test_tokens_increase_after_release(self):
        r=FenceRegistry(); a=r.acquire("x",30); self.assertTrue(r.validate(a))
        self.assertTrue(r.release(a)); b=r.acquire("x",30)
        self.assertGreater(b.token,a.token); self.assertFalse(r.validate(a)); self.assertTrue(r.validate(b))
    def test_expiry_reclaims_and_stales_old(self):
        now=[100.0]; r=FenceRegistry(clock=lambda:now[0])
        a=r.acquire("x",2); now[0]=103; self.assertFalse(r.validate(a))
        b=r.acquire("x",5); self.assertGreater(b.token,a.token)
        with self.assertRaises(RuntimeError): r.assert_valid(a)
    def test_active_lease_blocks(self):
        r=FenceRegistry(); a=r.acquire("x",10)
        with self.assertRaises(RuntimeError): r.acquire("x",10)
        r.assert_valid(a)
    def test_release_is_owner_scoped(self):
        r=FenceRegistry(); a=r.acquire("x",10)
        self.assertFalse(r.release(type(a)("x","wrong",a.token,a.expires_at)))
        self.assertTrue(r.validate(a))
    def test_invalid_ttl(self):
        r=FenceRegistry()
        with self.assertRaises(ValueError): r.acquire("x",0)

if __name__=="__main__": unittest.main()
