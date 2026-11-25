# RiverPay build roadmap

1. Core ledger and event records — draft schema (current PR).
2. Secure server-side provider configuration — secret environment variables, no secret UI exposure. API Manager readiness monitor drafted.
3. Checkout intent preparation endpoint with order ownership, amount validation and idempotency — preparation-only mode.
4. Hosted checkout adapter in test mode for one PSP; no card data on RiverSpend servers.
5. Signed webhook verification, replay protection and idempotent status updates — test-only Stripe path drafted; persisted-state confirmation added.
6. Balanced atomic journal posting via trusted database function and tests — not implemented.
7. Reconciliation dashboard against PSP settlements and fees — not implemented.
8. Refund/dispute flows, authorization controls and audit trail — not implemented.
9. Seller onboarding/KYC delegated to PSP; payout handling through provider-supported marketplace flows — not implemented.
10. Legal/accounting/compliance review and end-to-end test suite — pending.
11. Production enablement — only after successful reviews, tests, provider agreements and legal review.

## Monitoring and agent architecture

- Admin-only transaction/event monitor drafted (read-only).
- RiverSSAI agent architecture proposed with bounded read-only roles; autonomous money-moving actions excluded.

Do not implement an independent wallet, custody, or money-transfer functionality absent the appropriate regulatory authorization and agreements.
