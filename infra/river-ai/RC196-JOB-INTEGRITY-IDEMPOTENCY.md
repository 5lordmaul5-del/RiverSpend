# RC-196 — Job Integrity & Idempotency

SQLite prototype records idempotency keys and SHA-256 payload fingerprints. Repeated keys with the same payload return the existing state/result; reuse with a different payload returns a conflict. Processing records may be marked completed or failed.

**Limitations:** local single-host prototype. It does not atomically wrap external side effects, automatically recover processing records after crashes, define retention, authenticate callers, or coordinate across hosts. Integrations must use transactional/outbox patterns or downstream idempotency where possible. Tests authored, not CI-verified.
