# RC-184 — Persistent usage ledger (SQLite)

Prototype usage-event persistence for subscription metering. Events are unique by
request ID, totals are scoped to user and period, and the database survives
process re-instantiation.

## Important limitations
- Not a provider-cost or billing ledger; tokens are caller-reported.
- Not integrated with RC-183 plan policy or RC-182 worker.
- User IDs and plan keys must be resolved by authenticated trusted server code.
- This implementation does not atomically reserve quota before execution; races
  can exceed limits. Quota reservation/atomic policy enforcement is next.
- No payment integration or production deployment.

## Test
`python -m unittest infra/river-ai/test_rc184_usage_ledger.py`
