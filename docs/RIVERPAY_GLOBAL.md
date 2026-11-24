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
