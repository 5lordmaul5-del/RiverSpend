# RiverCloud Lock Fixture Scope — 2026-11-26

Authored-only fixtures:
- Existing lock contention with bounded timeout; assert that the pre-existing lock is untouched.
- Mutation rejection cleanup for the transaction-owned lock and snapshot preservation.

Not executed. These do not validate distributed locking, stale-lock recovery, multi-process timing under load, or filesystem guarantees.
