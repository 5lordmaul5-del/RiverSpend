# RiverSpend Park Gift Card — test checklist

Status: planned tests only. No test has been run against a database or live site from this document.

## Environment safety
- [ ] Use a separate Supabase test project, never the live RiverSpend project.
- [ ] Confirm the migration's referenced `public.orders(id)` type and all constraints against the test schema before applying.
- [ ] Keep product rows inactive and the Park gift purchase buttons disabled.
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` and `RS_PARK_STAFF_TOKEN` exist only in server-side environment settings and are not exposed as `NEXT_PUBLIC_*`.
- [ ] Use synthetic data only; do not reuse existing RiverSpendShop monetary gift cards.

## Endpoint behavior: POST /api/park-gift/redeem
- [ ] GET/PUT/etc. returns 405 and `Allow: POST`.
- [ ] Missing server configuration returns 503 without touching the database.
- [ ] Missing/wrong staff token returns 401.
- [ ] Invalid request shape, too-short secret, invalid public code, invalid idempotency key, zero/negative or >20 admissions returns 400.
- [ ] Unknown public code and wrong secret both return the same generic 404 response.
- [ ] Valid active card with enough admissions decrements exactly once and returns the remaining count.
- [ ] Pending-payment, blocked, expired, exhausted, and insufficient-admission cases are rejected without decrement.
- [ ] Repeat request with the same idempotency key does not decrement a second time.
- [ ] Two simultaneous scans cannot drive the remaining count below zero.
- [ ] Responses do not expose the stored hash, database error, secret, or service-role credential.

## Issuance / payment — not implemented yet
- [ ] Generate a high-entropy secret with a cryptographic RNG; store only its SHA-256 digest.
- [ ] Create the card as `pending_payment`, never `active`, before payment confirmation.
- [ ] Activate only after a trusted payment-provider server webhook is verified (signature, amount, currency, product, order, and event idempotency).
- [ ] Do not trust a client-side success redirect or a browser-supplied payment status.
- [ ] Return the raw secret only once through an authenticated, appropriately protected delivery flow.
- [ ] Put no database hash or service-role credential in the QR.
- [ ] Replace the prototype shared staff token with authenticated staff accounts/roles, revocation, rate limiting, and audit identity.

## Release gate
Do not merge or deploy until SQL review, all tests above, build checks, authentication review, and a real device scan test have passed in a dedicated preview/test environment. No production migration has been applied as part of this work.
