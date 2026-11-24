# RiverPay build roadmap

1. Core ledger and event records — draft schema (current PR).
2. Secure server-side provider configuration — secret environment variables, no secret UI exposure. (API Manager readiness monitor now drafted.)
3. Checkout intent preparation endpoint with order ownership, amount validation and idempotency — implemented in preparation-only mode.\n4. Hosted checkout adapter in test mode for one PSP; no card data on RiverSpend servers.
4. Signed webhook verification, replay protection and idempotent status updates.
5. Balanced atomic journal posting via trusted database function and tests.
6. Reconciliation dashboard against PSP settlements and fees.
7. Refund/dispute flows, authorization controls and audit trail.
8. Seller onboarding/KYC delegated to PSP; payout handling through provider-supported marketplace flows.
9. Legal/accounting/compliance review and end-to-end test suite.
10. Only after successful reviews and tests, consider production enablement.

Do not implement an independent wallet, custody, or money transfer functionality absent the appropriate regulatory authorization and agreements.
