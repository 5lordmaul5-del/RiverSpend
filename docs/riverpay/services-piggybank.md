# RiverPay services: PiggyBank, Signals and Streaming

This branch adds draft, server-side foundations for service purchase intents and PiggyBank goals. It is not a live payment integration.

## PiggyBank

- Authenticated API: `GET/POST /api/pay/piggybank/goals` lists a user's goals and creates a goal.
- Dashboard: `/servizi/pay/piggybank`.
- Saved progress is computed only from contributions with status `confirmed`; this API does not let a user self-confirm money.
- The new schema includes goal/contribution records and service intents.
- No cash, bank balance, wallet or payment is simulated.

## Services

The endpoint `POST /api/pay/service-intent` creates a pending purchase intention for a server-priced catalog item. Price values are configured in integer euro-cent environment variables:

- `RIVERPAY_PRICE_SIGNALS_LIFETIME_MINOR`
- `RIVERPAY_PRICE_SIGNALS_MONTHLY_MINOR`
- `RIVERPAY_PRICE_STREAMING_MONTHLY_MINOR`
- `RIVERPAY_PRICE_ZEN_MONTHLY_MINOR`
- `RIVERPAY_PRICE_FIDELITY_MONTHLY_MINOR`

Unset or invalid prices make the catalog item unavailable. Prices are never accepted from the client. These intents are preparation-only; this endpoint does not create a PSP checkout, mark services active, renew subscriptions, or transfer funds.

## Activation requirements

Before any real payment or entitlement activation: validate schema and auth, implement provider checkout adapter(s), webhook signature and replay checks, atomic transaction/entitlement state transitions, subscription renewal/cancellation/refund handling, customer disclosure and receipts, test-mode end-to-end tests, legal/provider review. Keep all service-specific entitlements inactive until trusted payment confirmation.
