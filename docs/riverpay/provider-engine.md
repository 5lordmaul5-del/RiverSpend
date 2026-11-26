# RiverPay Provider Engine — foundation

## Scope in this stage

The provider registry is a server-side readiness monitor only. It reports whether the expected test credentials and webhook configuration variables exist. It does not read or return their values, contact a provider, create a checkout, capture a payment, refund, or initiate a payout.

Implementation:
- `lib/riverpay/provider-registry.js` is the single source of provider readiness metadata.
- `pages/api/pay/admin/api-manager.js` authenticates the Supabase user, checks the `rs_admin_roles.role = admin` record, and returns readiness booleans only.
- `pages/servizi/pay/api-manager.js` displays the state in the admin interface.
- `pages/servizi/pay/controllo.js` links the existing RiverPay Control panel to API Manager.

## Hard safety gates

1. Provider adapters must default to disabled.
2. This registry must never be treated as proof that a merchant account is approved or that a payment flow is legally enabled.
3. Test credentials belong only in server-side environment variables. Never use `NEXT_PUBLIC_*` for secrets and never commit credentials.
4. Live payments and transfers remain disabled until provider contracts, merchant onboarding, webhook signature verification, idempotency, reconciliation, refunds/disputes, seller due diligence, and applicable regulatory responsibilities have been reviewed.
5. RiverSpend's own ledger records accounting events; it does not hold customer funds or replace a licensed bank/payment institution/PSP.
6. Do not assume legacy payment routes are governed by this registry. Audit and separately disable or sandbox legacy routes before any production rollout.

## Manual verification checklist

- Unauthenticated request to `GET /api/pay/admin/api-manager` returns 401.
- Authenticated non-admin request returns 403.
- Admin request returns only boolean readiness values, `mode: test_only`, `livePaymentsEnabled: false`, and `liveTransfersEnabled: false`.
- Unsupported HTTP methods return 405.
- Response has `Cache-Control: no-store`.
- Search response and logs to ensure no credential values are exposed.
- Confirm API Manager is reachable from RiverPay Control.
- Confirm the UI clearly shows each provider execution engine as disabled.

## Not yet verified

No local dependency installation, Next.js build, browser test, Supabase migration, or live provider test has been performed as part of this change. Keep PR #74 in draft until those checks are completed.
