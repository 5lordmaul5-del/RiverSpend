# RC210 — Knowledge Graph & Intelligence Memory
Small, offline graph prototype for explicit nodes and relation triples.

- Nodes have ID, type/kind, label and metadata.
- Edges require existing endpoints and a named relation.
- Node query returns incoming and outgoing relationships.
- Filter nodes by kind and export deterministic catalog.
- Duplicate edge insertion is idempotent.

This is a structural graph store in memory, not durable memory, semantic inference or an AI model. Metadata is caller-provided; avoid secrets and sensitive personal data. No network, persistence, integrations, merge or deployment.

Run: `python -m unittest infra/river-ai/test_rc210_knowledge_graph.py`
