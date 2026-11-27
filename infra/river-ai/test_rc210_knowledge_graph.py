import unittest
from rc210_knowledge_graph import KnowledgeGraph
class TestGraph(unittest.TestCase):
 def test_edges_and_query(self):
  g=KnowledgeGraph();g.add_node("a","module");g.add_node("b","feature")
  g.add_edge("a","contains","b")
  self.assertEqual(g.query_node("a")["outgoing"][0]["target"],"b")
 def test_unknown_endpoint(self):
  g=KnowledgeGraph();g.add_node("a","x")
  with self.assertRaises(KeyError):g.add_edge("a","rel","b")
 def test_dedup_edge(self):
  g=KnowledgeGraph();g.add_node("a","x");g.add_node("b","x")
  g.add_edge("a","rel","b");g.add_edge("a","rel","b")
  self.assertEqual(len(g.export()["edges"]),1)
 def test_kind(self):
  g=KnowledgeGraph();g.add_node("a","x");g.add_node("b","y")
  self.assertEqual(len(g.find_by_kind("x")),1)
if __name__=="__main__":unittest.main()
