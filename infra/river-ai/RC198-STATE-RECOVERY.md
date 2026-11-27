# RC-198 — State Recovery & Consistency

Adds conservative inspection/classification helpers for RC-196 idempotency records. A processing record younger than the configured threshold is classified as wait. A stale processing record is classified as manual reconciliation—not automatic retry—because age alone cannot prove the original worker stopped or external effects did not occur.

Prototype limitations: depends on RC-196 row schema; no transactional linkage to task ledger, lease/fencing systems or external side effects; no automated recovery/redispatch. Tests authored, not CI-verified.
