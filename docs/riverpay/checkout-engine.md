# RiverPay Checkout Engine — preparation stage

## Endpoint

`POST /api/pay/checkout/create`

Request body:
```json
{ "orderId": "existing-order-id", "provider": "stripe" }
```

Authentication: Supabase access token in the `Authorization: Bearer <token>` header.

## Implemented safeguards

- Accepts only Stripe, PayPal, and SumUp identifiers.
- Verifies the caller's Supabase session server-side.
- Reads the order from the database; does not trust client-supplied amount or currency.
- Requires the order to belong to the authenticated buyer.
- Requires order status `pending` and payment status not `paid`.
- Converts the database order total to integer minor units using the currency's fraction digits.
- Uses a stable order/provider idempotency key, so retries do not create duplicate transaction records.
- Stores only an internal RiverPay transaction record; no provider API is called.
- Returns HTTP 202 with `paymentCanProceed: false`, `mode: preparation_only`, and `livePaymentsEnabled: false`.
- Returns no payment URL and does not accept card data.

## Deliberate limitations

This is the checkout-intent preparation layer, not a working payment checkout. The PSP adapter, hosted checkout session creation, webhook signature verification, payment confirmation, refunds, disputes, and settlement are not implemented. The legacy PayPal and SumUp routes are separate and are not made safe or disabled by this endpoint.

## Required verification before integration

1. Test 401 for missing/invalid session, 403 for another user's order, 404 for unknown order, 409 for paid or non-pending orders.
2. Test invalid provider, currency and amount.
3. Test duplicate requests concurrently; verify one transaction row per order/provider.
4. Test order total changes after an initial intent; endpoint must reject mismatch rather than silently reuse stale amount.
5. Test JPY (zero fraction digits) and EUR/USD (two fraction digits).
6. Verify RLS and service-role access boundaries; inspect that no secret or provider URL is returned.
7. Run the project production build and route-level tests.
8. Only then add one PSP hosted-checkout adapter in sandbox mode. Do not capture funds from the browser return URL; only a verified provider webhook can establish a paid state.

## Production gate

Keep live payments disabled. Before production, complete provider merchant onboarding and agreements, signed webhooks with replay protection, reconciliation, refund/dispute handling, security review, tax/accounting review, and legal/regulatory review for the chosen marketplace model.

## Stripe hosted checkout — test-only adapter

Two additional endpoints now provide the first sandbox adapter:

- `POST /api/pay/checkout/stripe-session`: authenticates the buyer, reloads the order and total server-side, checks ownership and pending status, creates/reuses the RiverPay transaction idempotently, then creates a Stripe-hosted Checkout Session.
- `POST /api/pay/checkout/stripe-webhook`: verifies the Stripe signature against the raw request body, checks session metadata/amount/currency against the RiverPay transaction, deduplicates the provider event, and marks only the RiverPay transaction as `paid`.

Required server-only environment variables for the sandbox:
- `RIVERPAY_STRIPE_TEST_MODE=true`
- `RIVERPAY_STRIPE_SECRET_KEY=sk_test_...`
- `RIVERPAY_STRIPE_WEBHOOK_SECRET=whsec_...`

Never put these in `NEXT_PUBLIC_*`, source files, browser storage, screenshots, or chat messages. Configure them only in the deployment environment's server-side secret settings. Use Stripe test-mode credentials and a test webhook endpoint only.

The sandbox webhook deliberately does **not** update `orders`, confirm fulfillment, allocate treasury movements, or initiate seller payouts. It records a test result only in RiverPay's internal transaction/event tables. This prevents a simulated payment from triggering Shop fulfillment or accounting workflows.

The older routes under `/api/pay/stripe/*` are legacy routes and are not called by this adapter. They need a separate security review and must not be assumed to inherit the new test-only restrictions.
