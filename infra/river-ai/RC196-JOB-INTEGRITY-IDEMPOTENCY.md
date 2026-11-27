# RC-196 — Job Integrity & Idempotency

SQLite prototype records idempotency keys and SHA-256 payload fingerprints, scoped by owner. Repeated keys within the same owner and with the same payload return existing state/result; reuse within that owner with a different payload returns a conflict. Different owners may independently use the same key without seeing each other's state or results.

The registry migrates the previous ownerless schema by assigning existing rows to the reserved owner `__legacy_migration__`, which is not accepted by the public owner-validation path. Input and stored result/error sizes are bounded. Tests include owner separation, migration and concurrent duplicate submissions.

**Limitations:** local single-host prototype. It does not atomically wrap external side effects, automatically recover processing records after crashes, define retention, authenticate callers, or coordinate across hosts. Integrations must use transactional/outbox patterns or downstream idempotency where possible. It remains separate from the RC-181 task ledger until explicitly integrated.
