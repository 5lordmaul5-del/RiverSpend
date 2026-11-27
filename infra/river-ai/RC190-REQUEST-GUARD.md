# RC-190 — Request guard

Prototype implements per-subject request windows, temporary blocking on limit exhaustion, concurrency ceiling, and explicit release. SQLite transaction serialization is local/single-host only.

## Integration/safety boundaries
- Subject IDs must come from trusted authentication (RC-189 trust boundary), not user input.
- Must integrate acquire/release with service lifecycle; crashes can leave active counts stuck (requires leases/expiry in future iteration).
- Does not provide distributed enforcement, IP protections, bot detection, adaptive limits, or observability.
- SQLite journal is not an enterprise rate-limit backend.
- Tests authored, not run in CI; draft PR only, no merge/deployment.
