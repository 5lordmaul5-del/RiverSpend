import unittest
from rc215_river_sentinel import normalize, deduplicate, analyze, render_markdown

SAMPLE={"title":"New research announcement","company":"Anthropic","category":"research",
 "summary":"Publicly announced research program.","source_name":"Company blog",
 "source_url":"https://example.org/research","published_at":"2026-11-27T12:00:00Z"}

class TestRC215(unittest.TestCase):
 def test_normalizes_and_stable_id(self):
  a=normalize(SAMPLE,collected_at="2026-11-27T00:00:00Z")
  b=normalize(SAMPLE,collected_at="2026-11-27T00:00:00Z")
  self.assertEqual(a.signal_id,b.signal_id)
 def test_validation(self):
  with self.assertRaises(ValueError): normalize({**SAMPLE,"category":"secret"})
  with self.assertRaises(ValueError): normalize({**SAMPLE,"source_url":"javascript:bad"})
  with self.assertRaises(ValueError): normalize({k:v for k,v in SAMPLE.items() if k!="title"})
 def test_dedup(self):
  a=normalize(SAMPLE,collected_at="2026-11-27T00:00:00Z")
  self.assertEqual(len(deduplicate([a,a])),1)
 def test_analysis_and_report(self):
  a=normalize(SAMPLE,collected_at="2026-11-27T00:00:00Z")
  self.assertEqual(analyze([a])["count"],1)
  self.assertIn("Anthropic",render_markdown([a]))

if __name__=="__main__": unittest.main()
