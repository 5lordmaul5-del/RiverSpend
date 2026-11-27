# RC-195 — Crash Reaper

Prototype for lease-based abandoned-task recovery: queued task submit, owner-scoped claim, heartbeat lease extension, completion and bounded reaping of expired running tasks. Reaper requeues expired tasks until max attempts, then marks dead-letter.

**Limitations:** local SQLite; no fencing enforcement, downstream idempotency, integrated queue/ledger, distributed guarantees, or actual process-kill detection. Reaping does not prove an old worker stopped; downstream must enforce fencing/ownership to avoid duplicate side effects. Tests authored, not CI-verified.
