import os,tempfile,unittest
from rc211_persistent_graph import PersistentKnowledgeGraph
class TestRC211(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.path=os.path.join(self.tmp.name,"g.db");self.g=PersistentKnowledgeGraph(self.path)
 def tearDown(self):self.g.close();self.tmp.cleanup()
 def test_persist_reopen(self):
  self.g.add_node("a","module");self.g.add_node("b","feature");self.g.add_edge("a","links","b")
  self.g.close();self.g=PersistentKnowledgeGraph(self.path)
  self.assertEqual(self.g.query_node("a")["outgoing"][0]["target"],"b")
 def test_missing_endpoint(self):
  self.g.add_node("a","x")
  with self.assertRaises(KeyError):self.g.add_edge("a","links","missing")
 def test_kind_and_metadata(self):
  self.g.add_node("n","type","N",{"v":2})
  self.assertEqual(self.g.find_by_kind("type")[0]["metadata"]["v"],2)
 def test_idempotent_edge(self):
  self.g.add_node("a","x");self.g.add_node("b","x")
  self.g.add_edge("a","r","b");self.g.add_edge("a","r","b")
  self.assertEqual(len(self.g.export()["edges"]),1)
if __name__=="__main__":unittest.main()
