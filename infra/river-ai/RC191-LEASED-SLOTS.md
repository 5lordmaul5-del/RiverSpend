# RC-191 — Expiring worker concurrency leases

SQLite-backed prototype adds lease IDs, expiration, reclaim on acquisition, heartbeat extension, and subject-scoped release. It reduces stale slot accounting when a process disappears, because expired slots can be reclaimed.

## Limits and safety
- Local SQLite only; not distributed coordination.
- Leases do not stop a worker that continues after its lease expires; execution must check/fence lease ownership before side effects.
- No integration with RC-190 guard, task runner, authentication, or worker execution lifecycle yet.
- Clock assumptions and single-host SQLite semantics apply.
- Tests are authored but not run in CI. Draft PR; no merge/deployment.
