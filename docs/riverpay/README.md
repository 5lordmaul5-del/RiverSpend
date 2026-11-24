# RiverPay — Core foundation

RiverPay is RiverSpend's provider-independent payment orchestration and accounting layer. This foundation does **not** itself receive, custody, transmit or settle funds. A regulated payment service provider (PSP) must handle those activities under the applicable agreement and regulatory framework.

## Scope in this first foundation
- Internal transaction ledger records (amounts in minor units, currency, status, idempotency key).
- Provider webhook-event deduplication table.
- Database tables are server-only with RLS enabled and direct anon/authenticated access revoked.
- Provider adapters and credentials are deliberately not activated; no keys are stored in source control.

## Intended flow
1. Server creates a pending payment record with a unique idempotency key.
2. A provider adapter creates a checkout/payment session using server-side credentials.
3. Customer pays at the provider's hosted/secure interface.
4. Server validates webhook signature, deduplicates provider event, and updates transaction status.
5. Refunds, disputes and seller settlement records are handled via provider APIs and reviewed reconciliation processes.

## Credential setup (when adapter is implemented)
Store provider secrets in Vercel project Environment Variables or a managed secret vault; never in NEXT_PUBLIC variables, browser storage, repository files or logs. Keep test and live credentials separate. Require webhook signature verification and rotation procedures.

## Not yet implemented / not production ready
- Checkout endpoint or UI; provider adapter; webhook signature verification; refunds; disputes; payout controls; seller onboarding/KYC; reconciliation; tax and regulatory review.
- No real payment is processed by this code. Do not merge or deploy to production until these items and tests are completed.
