# RC-12 — fail-closed lock handling and chained audit helper

This milestone provides a local hash-chain helper and lock acquisition helper. Automatic stale-lock reclamation is **disabled**: PID checks and rename-based reclamation can race, and PID reuse/namespaces can make the decision unreliable.

- Existing lock files are preserved for manual review.
- Lock acquisition fails with a bounded timeout instead of deleting/reclaiming a lock automatically.
- The event hash-chain helper detects changes in the stored chain.

## Test evidence

Tests cover chain integrity, preservation of old/recent/active/malformed locks, and bounded timeout. Automatic recovery is not implemented.

## Limits

Manual stale-lock review is still required. Lock behavior, crash durability and directory sync need target-platform tests. This is not a distributed-lock mechanism. Identity authentication, external protected audit, execution isolation, deployment and production remain out of scope.
