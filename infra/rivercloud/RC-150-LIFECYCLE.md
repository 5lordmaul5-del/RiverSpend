# RC-150 — guarded lifecycle

RiverCloud lifecycle states are currently limited to:
- `planned_not_queued`
- `prepared_not_executed`
- `verified`
- `rejected`

Only transitions explicitly listed in `lifecycle-guard.mjs` are accepted. The transition helper validates plain record shape and own data descriptors, rejects inherited/accessor status values, and returns a frozen copy. No transition to executing, running, deployed, or production exists.

This is a local state-transition guard, not an authorization or execution engine. Runner remains disabled; state records alone do not establish trusted approvals.
