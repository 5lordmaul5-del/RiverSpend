# RS Scratch — backend readiness & verification plan

Status: design/prototype only. No endpoint is live and no prize is issued.

## Required backend invariants
- Campaign and reward configuration is server-side; the client never chooses prize odds, reward codes, stock or eligibility.
- Eligibility and claim limits are checked on the server, backed by transaction/locking and unique constraints.
- Idempotency key is scoped to user + campaign; repeat requests return the original result and do not consume inventory twice.
- Prize stock decrement and claim/award/ledger creation occur in one transaction.
- Append-only ledger; corrections are compensating entries, not edits/deletes.
- Rate limit per account, IP/device risk signals, and abuse monitoring; avoid collecting unnecessary personal data.
- Authentication, authorization, CSRF protections (where relevant), input validation, audit logs, and secret management.
- Never activate campaigns before legal review of promotional rules, eligibility, prize taxation, and applicable Italian/EU requirements.

## Proposed response contract
- Eligibility: 200 { eligible, reason?, remainingClaims? }.
- Claim: 201 { claimId, state }; repeat idempotency key: same claim/result.
- Claim errors: 400 invalid input; 401 unauthenticated; 403 not eligible; 409 limit/stock/idempotency conflict; 429 throttled.
- Reveal endpoint must reveal the server-recorded outcome only, never calculate it client-side.
- Redemption: one-time token, expiry, server-side state transition; 409 for already redeemed/expired/void.

## Pre-launch verification
1. Run the reference tests with Node: `node --test docs/rs-scratch/engine-reference.test.mjs`.
2. Add integration tests using a disposable database and concurrent claim requests.
3. Prove duplicate idempotency requests produce one claim, one award, and one inventory decrement.
4. Prove stock cannot go below zero under concurrency.
5. Verify authorization boundaries, throttling, replay resistance, audit trail and privacy.
6. Run legal review and approve written campaign rules before any live activation.

## Explicit exclusions
No paid chance, no cash/cash-convertible rewards, no paid extra scratch attempts, no randomized prize selection implemented here. This document is not legal advice or a deployed service.
