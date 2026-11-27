# RC211 — Persistent Knowledge Storage
Local file-backed SQLite store for graph nodes and edges.

- SQLite persistence across reopen/restart.
- Node metadata and edge metadata encoded as JSON.
- Foreign-key endpoint checks and deterministic queries/export.
- Duplicate edge key with update semantics.
- Standard library only.

## Usage
Instantiate `PersistentKnowledgeGraph("river_memory.db")`; close when finished. Keep file in a controlled local directory, back it up and restrict filesystem access. Do not store secrets or sensitive personal information in prototype metadata.

## Limitations
No encryption at rest, distributed access, semantic retrieval, automatic backup, migration/versioning strategy or multi-process coordination is provided. Tests authored, not executed.

Run: `python -m unittest infra/river-ai/test_rc211_persistent_graph.py`
