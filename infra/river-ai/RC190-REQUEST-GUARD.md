# RC-190 — Request guard with expiring leases

Follow-up adds expiring SQLite leases to the single-host request guard.

- Each accepted acquire returns a unique lease token.
- Active concurrency is counted from leases, not a stale counter.
- Leases expire automatically during subsequent acquire calls; explicit reaper is also available.
- Release is token-based and idempotent for unknown/expired tokens.
- Tests cover expired lease recovery, reaper, concurrency, rate windows and edge cases.

## Scope and limitations
Local SQLite/single-host prototype. A lease expiry can allow a new request while the old process is still running; this does not fence external side effects. Production integration needs trusted caller identity, fencing/idempotency at downstream operations, observability, and multi-host coordination. No merge or deployment.
