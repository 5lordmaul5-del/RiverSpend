# RC-11 transactional state prototype
A single local JSON state file combines jobs, approval records and event history. A lock file serializes mutation, and the updated file is replaced by rename. Includes bounded lock timeout, schema check, job transition recording and one-use approval consumption under the same transaction boundary.

This is a local prototype: lock semantics and crash durability need testing across target filesystem/platform; directory fsync and stale-lock recovery are not implemented; identities are not authenticated; events are not cryptographically chained in this store; JSON file is not suitable for scale; no runner or deployment execution exists. Do not expose or use in production.
