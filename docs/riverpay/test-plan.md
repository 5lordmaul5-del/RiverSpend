# RiverPay test plan

## Checkout and webhook (test environment only)

- Amounts are integer minor units; zero, negative, unsafe integers and malformed currency are rejected.
- Buyer ownership: a buyer cannot create checkout for another buyer's order.
- Order eligibility: reject orders that are not pending or are already paid.
- Idempotency: retrying payment-create does not create a duplicate internal transaction.
- Session reuse: reuse an open hosted session; reject completed or expired session cases safely.
- Webhook authenticity: invalid signature rejected; no raw secrets or full sensitive payloads logged.
- Test/live separation: reject Stripe live event, live session, or missing test-only metadata.
- Amount and currency: reject mismatch between Stripe session and internal transaction.
- Replay: repeated event ID is deduplicated; processed event is acknowledged without repeat mutation.
- Concurrent delivery: verify the persisted transaction state/session ID before marking the event processed.
- State transitions: reject invalid/backward transitions; refunds and disputes require separate reviewed paths.
- Shop integration: this test webhook must not mark a Shop order paid, initiate fulfillment, treasury allocation, or seller payout.

## Ledger

- Posting must be atomic; debit/credit totals balance per currency.
- Failed posting leaves no partial journal/entries.
- Posted entries cannot be edited/deleted; corrections use reversal entries.
- Account type and currency validation is enforced server-side.

## Access and operations

- No client-side direct access to payment or ledger tables.
- Admin-only monitor endpoints reject unauthenticated and non-admin requests.
- Finance/admin access is audited.
- Reconciliation compares provider totals, fees, refunds, disputes and settlement reports.
- Provider test scenarios include payment success/failure, webhook retry, refund, dispute and payout.
- Secrets remain server-side, test/live separation is strict, and rotation is documented.
- CI/build and end-to-end testing must pass before any deployment or migration.
