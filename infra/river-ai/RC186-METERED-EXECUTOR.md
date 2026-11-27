# RC-186 — Metered executor adapter
Connects RC-183 plan budget to RC-185 reservations and an injected execution callback.
Trusted identity and billing period come from server-side resolvers. The task supplies a positive estimate; over-budget requests are rejected before execution. Executor output may report usage_tokens up to the reserved estimate. Usage is committed to the RC-184 ledger through RC-185. On exceptions, active holds are released.

**Prototype boundaries:** Not wired into RC-182 runner/service/authentication. Request IDs currently derived from task IDs; uniqueness across user/period must be enforced. Overshoot is rejected rather than atomically adjusted; tasks with side effects could already have run, so this adapter should only wrap safe/idempotent executors. No billing. Tests authored, not run in CI.
