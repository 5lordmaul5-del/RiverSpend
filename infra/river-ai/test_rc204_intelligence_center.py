import unittest
from rc204_intelligence_center import IntelligenceCenter

class CenterTests(unittest.TestCase):
 def setUp(self): self.center=IntelligenceCenter()
 def test_catalog_includes_core_modules(self):
  ids={x["module_id"] for x in self.center.catalog()}
  self.assertTrue({"market","risk","financial","economic","logistics","customer","bankflow"}<=ids)
 def test_get_module(self):
  self.assertEqual(self.center.get("risk")["name"],"Risk Intelligence")
 def test_unknown_module(self):
  with self.assertRaises(KeyError): self.center.get("missing")
 def test_route_is_metadata_only(self):
  r=self.center.route("market",{"symbol":"TEST"})
  self.assertEqual(r["invocation"],"not-executed")
 def test_payload_type(self):
  with self.assertRaises(TypeError): self.center.route("market",[])
if __name__=="__main__": unittest.main()
