# RC206 — Source Registry & Trust Engine
Offline metadata catalog for declared data sources and provenance/quality signals.

## Features
- Unique source IDs and catalog listing.
- Ownership, source kind, license/rights note, permitted-use declaration, refresh interval, provenance note, enable/disable.
- Freshness assessment against declared refresh interval.
- Metadata score and warning list for stale/invalid timestamps, missing ownership/license/permitted-use, or disabled sources.
- JSON-like export of catalog metadata.

## Limitations / safeguards
This does **not** authenticate sources, verify truth, evaluate legal compliance, or guarantee security. Scores are transparent heuristic metadata signals, not a reputation verdict. Do not store personal data, credentials, secrets, or restricted datasets here. Register feeds only when access and usage rights are documented. No network fetches or automated scraping.

## Test
Run: `python -m unittest infra/river-ai/test_rc206_source_registry.py`
