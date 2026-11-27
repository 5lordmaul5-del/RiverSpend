# RC-190 — Request guard hardening

This iteration tightens input handling for the single-host SQLite request guard.

- Config values must be integers and within sensible positive bounds.
- Subject identifiers must be trimmed strings, non-empty, and at most 256 characters.
- Explicit clock overrides must be integers.
- Invalid release/state subjects are handled safely.
- Expanded tests cover malformed subjects, invalid config/time, rate limiting, concurrency, window reset, and block/window boundaries.

## Scope and limits
Still a local prototype. Active counters can remain stale after process crashes because lease expiry/recovery is not implemented. Authentication must provide trusted subject identifiers. No distributed rate limiting or production readiness implied.
