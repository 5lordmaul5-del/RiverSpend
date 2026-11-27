import unittest
from datetime import datetime, timezone
from rc206_source_registry import Source, SourceRegistry

class TestRegistry(unittest.TestCase):
    def test_register_and_duplicate(self):
        r=SourceRegistry(); s=Source("s1","Demo","manual","owner","public","research",60)
        r.register(s)
        with self.assertRaises(ValueError): r.register(s)

    def test_freshness(self):
        r=SourceRegistry(); r.register(Source("s","Demo","manual","owner","note","research",60,"2026-01-01T00:00:00Z"))
        a=r.assess("s",datetime(2026,1,1,0,0,30,tzinfo=timezone.utc))
        self.assertEqual(a["freshness"],"fresh")
        b=r.assess("s",datetime(2026,1,1,0,2,tzinfo=timezone.utc))
        self.assertEqual(b["freshness"],"stale")

    def test_missing_rights_warning(self):
        r=SourceRegistry(); r.register(Source("s","Demo","manual","","","","60"))
        self.assertTrue(r.assess("s")["warnings"])

if __name__=="__main__": unittest.main()
