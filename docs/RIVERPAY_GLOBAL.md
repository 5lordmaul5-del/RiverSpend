# RiverPay Global — Operating Architecture

## Mission

RiverPay Global is the payment orchestration and reconciliation layer for RiverSpendShop and the wider RiverSpend ecosystem. RiverSpend owns the commerce experience, order rules, commissions, delivery milestones and reporting. A regulated payment service provider (PSP) or marketplace-platform provider processes customer payments and executes supported transfers and payouts.

RiverSpend must not receive, pool, safeguard or transmit customer/seller funds itself unless a separately reviewed legal structure and required authorisations explicitly permit it.

## Target money flow

1. A customer places an order and sees the total, currency, shipping, taxes and applicable fees before payment.
2. RiverPay creates a server-side payment session with the selected provider. Card details remain with the provider; RiverSpend never stores PAN or CVV.
3. The provider authenticates/authorises and captures the payment according to its checkout flow.
4. A signed provider webhook is verified. Only a verified capture/paid event can mark an order paid.
5. RiverPay records the gross amount, provider fees, tax components, refunds, reserves and each beneficiary allocation in an auditable ledger.
6. The provider/platform account pays the seller according to the seller agreement and the provider's release rules.
7. A carrier receives its contracted fee after delivery is confirmed and the required invoice/contract checks are complete.
8. RiverSpend's net commission and other earned fees are settled to the verified RiverSpend business bank account on the agreed provider schedule.
9. Refunds, disputes, chargebacks, failed payouts and reversals are reconciled against the original order and ledger entries.

## Provider strategy

- **Marketplace/platform provider (required for split settlement):** Stripe Connect is the initial technical candidate; Adyen for Platforms is the alternative for commercial and geographic due diligence.
- **Single-seller checkout:** existing PayPal and SumUp integrations may remain available for eligible flows, but they must not be treated as marketplace split-payout infrastructure.
- **No provider is selected or approved yet.** Selection requires review of RiverSpend's legal entity and country, platform eligibility, supported countries/currencies, onboarding/KYC, seller and carrier account model, split rules, reserves, refunds, chargebacks, fees, settlement timing and contract terms.
- Provider adapters must be replaceable. Shop, RSSpons, VIVA, RiverSignals and other services call RiverPay's internal API; they do not integrate directly with each PSP.

## Ledger and states

Keep payment, fulfilment and payout states independent.

- Payment: `created → requires_action → processing → paid` or `failed / cancelled / refunded / disputed`.
- Fulfilment: `unfulfilled → dispatched → delivered / returned`.
- Beneficiary allocation: `calculated → pending_release → eligible → submitted_to_provider → paid` or `held / failed / reversed`.

Each provider event must be signature-verified, deduplicated by provider + event ID, and processed idempotently. Ledger entries are append-only; corrections are compensating entries, not silent edits. A paid order is not proof that a seller or carrier has been paid.

## Allocation rules

For each order, calculate separate ledger allocations for:
- seller proceeds;
- shipping/carrier amount;
- RiverSpend commission and service fees;
- taxes and statutory amounts where applicable;
- provider fees;
- refunds, reserves and dispute exposure.

The allocation formula is configured by contract and market, not hard-coded as one global percentage. Never promise that a seller or carrier will be paid immediately after a customer payment. Delivery-based release is subject to provider rules, reserves, local law and the parties' contracts.

## Security and compliance gates

- Provider credentials stay in server-side secret storage, never Git, client bundles, public tables or API responses.
- Verify webhook signatures against the raw request body.
- Use idempotency keys for checkout, capture, refunds and payout requests.
- Enforce authentication, role checks and row-level security for all financial records.
- Apply provider onboarding/KYC, beneficial-owner checks, sanctions/AML controls and tax/reporting obligations as required for each market.
- Do not store card PAN/CVV.
- No live charge, refund, transfer or payout without provider approval, production credentials, tested webhook delivery, reconciliation and explicit owner approval.
- A configured API key does not mean the merchant/platform account is approved or live.

## Rollout

### Phase 1 — Foundation (current)
- Establish this provider-neutral operating model and central configuration.
- Keep live charges and all payouts disabled.
- Inventory current PayPal, SumUp and Stripe routes and existing payment/treasury tables before modifying schemas.
- Define the internal order, ledger, beneficiary and payout contracts.

### Phase 2 — Sandbox marketplace
- Select one marketplace PSP after eligibility and fee review.
- Complete test onboarding for platform, one seller and one carrier/recipient where supported.
- Implement split allocation, delivery release, refund, dispute and payout webhooks.
- Test duplicates, out-of-order events, failed transfers, partial refunds and reconciliation.

### Phase 3 — Controlled pilot
- Complete legal, tax, accounting and provider approval checks.
- Activate a small, capped pilot only after explicit owner approval.
- Reconcile provider statements against RiverPay's immutable ledger.

### Phase 4 — International expansion
- Add countries, currencies and local payment methods only when the provider and RiverSpend entity are eligible.
- Add a second PSP only where it improves coverage or resilience without creating inconsistent settlement records.

## Current status

This file and `config/riverpay-global.json` define the target architecture only. They do not create a PSP account, establish a bank relationship, enable marketplace payouts, activate live checkout or move money. The next engineering step is a careful inventory of the current database migrations and payment routes, followed by a sandbox-only adapter and ledger tests.


## Implemented database foundation (2026-11-24)

The existing database already contained the RiverSpend treasury ledger and payment backbone:
- `payment_orders`, `payment_transactions`, `payment_refunds`, `payment_events`;
- `rs_treasury_movements`, `rs_treasury_allocations`, `rs_treasury_accounts`, `rs_treasury_allocation_rules`;
- `seller_payouts`, `rs_payment_providers`, `rs_revenue_sources`.

Do not recreate these objects. The new migration `20261124100910_riverpay_global_payouts_and_settlement_control.sql` adds:
- `rs_financial_payouts`: provider-neutral seller, carrier and RiverSpend settlement records, delivery release gate for carrier payouts, provider references, schedule and idempotency;
- `rs_financial_settlement_batches`: weekly/monthly/manual settlement batches and provider reconciliation references;
- `rs_financial_payout_events`: deduplicated payout event history.

All three new tables have RLS and administrator-only policies. Browser roles cannot call the treasury allocation RPC; only the server-side `service_role` can execute it. No bank account number, card data or provider secret is stored in these tables.

The migration was applied to the active Supabase project and verified: all three tables exist, their admin policies are present, and the treasury RPC is denied to `anon` and `authenticated` while remaining available to `service_role`.

## Implemented control panel and remaining work (2026-11-24)

The owner-only RiverPay control panel/API is implemented:
- Page: `/servizi/pay/controllo`.
- API: `GET /api/pay/admin/overview`.
- The API validates the Supabase access token, checks the `admin` role in `rs_admin_roles`, and reads financial records server-side.
- The response is marked `preparation_only` with `liveTransfersEnabled: false`; it exposes no bank account details, card numbers, CVV or provider credentials.
- The public RiverPay page links to the control panel.
- Legacy treasury access policies were hardened in `20261124101030_riverpay_secure_legacy_treasury_admin_access.sql`; authenticated reads are admin-only and browser roles cannot execute the treasury allocation RPC.

Deployment verification on 2026-11-24:
- Production deployment for commit `2de5af4907ce03810dd2fb12ffec6ddd8bdc031e` reached `READY`.
- `https://www.riverspend.com/servizi/pay` and `https://www.riverspend.com/servizi/pay/controllo` both returned HTTP 200.
- Vercel reported no runtime error clusters in the last 24 hours.
- The page shell was fetched successfully, but an authenticated administrator session and the API's 401/403 behavior have not yet been end-to-end tested. Do not treat this as a completed authorization test.

Next engineering steps:
- Add automated tests for missing/invalid tokens, non-admin users, admin access, and missing server configuration.
- Build a provider-neutral sandbox adapter and signed webhook handler after a marketplace PSP sandbox is selected and provisioned.
- Test duplicate and out-of-order webhooks, idempotent checkout/refunds, partial refunds, failed transfers, delivery release gates and settlement reconciliation.
- Keep live charges, refunds, transfers and payouts disabled until company/bank onboarding, provider approval, legal/accounting review, end-to-end sandbox verification and explicit owner approval.
