# RiverPay API Manager

Added a CEO/admin-only readiness endpoint and dashboard:
- UI: `/servizi/pay/api-manager`
- Endpoint: `GET /api/pay/admin/api-manager`
- Checks configuration presence for Stripe, PayPal and SumUp test credentials and webhook settings.
- Does not expose credential values; cache disabled; Supabase user token validated and admin role required.
- Hard-coded test-only display; no live payment, checkout, capture, transfer or payout is activated.

Server environment variable names expected:
`RIVERPAY_STRIPE_SECRET_KEY`, `RIVERPAY_STRIPE_WEBHOOK_SECRET`,
`RIVERPAY_PAYPAL_CLIENT_ID`, `RIVERPAY_PAYPAL_SECRET`, `RIVERPAY_PAYPAL_WEBHOOK_ID`,
`RIVERPAY_SUMUP_API_KEY`, `RIVERPAY_SUMUP_WEBHOOK_SECRET`.

This readiness monitor is not a payment integration or production certification.
