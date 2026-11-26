# RiverPay + RiverSSAI Agents — safe architecture proposal

## Agent roles (bounded permissions)
- **RiverPay Sentinel:** read-only transaction/event health checks, anomaly flags, webhook delay and duplicate detection.
- **RiverPay Reconciler:** read-only matching of internal records to PSP reports/settlements; produces discrepancy reports.
- **RiverPay Risk Observer:** read-only signals for unusual order/payment patterns; never rejects/approves autonomously in the initial phase.
- **RiverPay Support Agent:** explains payment status using approved internal data; no access to card data, secrets, or unrestricted customer PII.
- **RiverPay Treasury Analyst:** read-only calculations, fee/commission simulations and settlement summaries; cannot initiate transfers.
- **RiverPay Compliance Assistant:** checklists and document completeness review; does not decide legal compliance or KYC outcomes.

## Tool permissions
- Initially expose only read-only, narrowly scoped server tools.
- Do not expose raw database access, service-role credentials, secret environment variables, card data, or arbitrary SQL to any agent.
- Financial write tools (capture, refund, payment creation, payout, transfer, ledger posting, order-paid state, fulfillment) are excluded from the agent tool set.
- If a write workflow is added later, it must be a fixed server-side action with authorization, strict schema validation, idempotency, audit logging, risk checks, and a separate human confirmation step; the model cannot bypass these controls.
- Agent output is advisory and cannot itself establish payment success. Only verified provider signals and trusted application/database logic do that.

## Suggested orchestration
1. RiverPay event/transaction monitor supplies limited normalized data.
2. Sentinel checks state transitions, stale pending transactions and webhook events not processed.
3. Reconciler compares provider reports with internal transaction IDs/amount/currency.
4. Risk Observer produces flags and reasons for human review.
5. Admin panel presents results and auditable recommendations.
6. Humans or deterministic backend workflows approve any financial action.

## Phased build
- Phase 1: read-only monitor and bounded agent report generation.
- Phase 2: scheduled read-only reconciliation, anomaly flags and audit trail.
- Phase 3: approval-gated operational tools only after threat model, tests, provider agreements and regulatory review.
- Phase 4: never grant agents custody, unrestricted payment initiation or arbitrary transfer authority.

This proposal does not create autonomous payment handling or transfer capability and is not a substitute for licensing, PSP contracts or compliance review.
