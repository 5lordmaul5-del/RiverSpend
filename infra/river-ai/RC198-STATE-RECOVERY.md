# RC-198 — Owner-scoped State Recovery Classification

Uses the current RC-196 registry API and inspects processing records only within the supplied owner/key scope.

- Recent processing records are classified as wait.
- Stale processing records are classified as manual reconciliation, never automatic redispatch.
- Staleness thresholds must be finite, numeric and non-negative.

A timestamp alone cannot prove that an executor stopped or that an external side effect did not occur. This remains a decision-only helper, not a recovery coordinator or worker/lease integration.
