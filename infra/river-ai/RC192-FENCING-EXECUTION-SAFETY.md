# RC-192 — Fencing & Execution Safety

This SQLite prototype issues monotonically increasing fencing tokens per resource.
A lease is valid only while the stored token, lease ID, and expiry match.

## API
- `acquire(resource, ttl)`: atomically issues the next token; blocks acquisition while a current lease is unexpired.
- `validate(lease)` / `assert_valid(lease)`: local current-lease checks.
- `release(lease)`: owner/token scoped release.

## Safety caveat
A local check cannot prevent a worker from performing an external side effect after it becomes stale.
For end-to-end safety, the downstream resource must atomically reject any operation whose fencing token
is lower than the highest token it has accepted for that resource. This module does not provide that
downstream enforcement, distributed consensus, authentication, or multi-host guarantees. Treat as a
single-host prototype. Tests are authored but not CI-verified.
