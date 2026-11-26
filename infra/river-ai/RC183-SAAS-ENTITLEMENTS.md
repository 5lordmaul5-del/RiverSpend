# RC-183 — RiverSSAI SaaS entitlement foundation

Adds a small, pure-Python policy layer for future subscription enforcement.

## Illustrative tiers (not finalized commercial offers)
| Tier | Indicative price/month | Monthly token budget | Concurrent tasks | Features |
|---|---:|---:|---:|---|
| Free | €0 | 100,000 | 1 | chat |
| Plus | €7.90 | 1,000,000 | 2 | chat, file analysis |
| Pro | €19.90 | 5,000,000 | 4 | chat, file analysis, agents |
| Ultra | €39.90 | 15,000,000 | 8 | chat, file analysis, agents, priority |

These are sample values for engineering tests, not pricing commitments. Budgets are
illustrative token units; model costs and limits require cost analysis.

## API
- `get_plan(key)`
- `check_feature(key, feature)` / `require_feature(...)`
- `check_task_capacity(key, active_tasks)` / `require_task_capacity(...)`
- `check_monthly_budget(key, used_tokens, requested_tokens)` / `require_monthly_budget(...)`

## Security and scope
- No account identity, authentication, payment processor, subscription lifecycle,
  persistent usage ledger, or server integration is included.
- Call this policy only after a trusted server has resolved the user's plan.
  Never accept plan keys or usage totals directly from a client as authority.
- Future work must add authenticated identity, persistent metering, atomic quota
  enforcement, provider-cost limits, privacy controls, and billing integration.
- No production billing, deployment, or live payment effects.

## Run tests
`python -m unittest infra/river-ai/test_rc183_saas_entitlements.py`
