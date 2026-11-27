# RS Scratch & Win — Prototype Specification (Non-activated)

Status: prototype design only. Not a public lottery or gambling product. No monetary stake, cash-out, paid attempts, or live chance-based promotion. Public launch requires legal review and applicable Italian promotional-prize compliance.

## Principles
- Free, non-monetary participation mechanics for prototype testing only.
- Reward categories: RSP points (non-transferable/non-cash), shop vouchers, promotional items.
- No purchasable attempts, reloads, wagering, loss chasing, or cash conversion.
- Alternative free participation method and full rules must be considered for any real promotion.
- Deterministic server-side award decision; client never decides outcome.
- Idempotent redemption; each award has unique ID and cannot be redeemed twice.
- Maintain auditable event log, privacy minimization, and retention policy.

## Components
1. RS Scratch UI: reveal animation, accessibility and reduced-motion support.
2. Reward policy service: campaign eligibility, limits, prize inventory, rules version.
3. Award ledger: append-only events (issued, claimed, expired, voided).
4. Redemption service: idempotency keys, atomic state transitions.
5. Admin console: campaign controls, budget caps, inventory, audit exports.
6. Nova audit: anomaly detection and alerts; no autonomous prize-value changes.

## API contract (illustrative)
- POST /api/rs-scratch/eligibility — campaign and user eligibility, limits; no outcome.
- POST /api/rs-scratch/claim — issue free eligible participation; idempotent.
- GET /api/rs-scratch/claim/:claimId — retrieve reveal state.
- POST /api/rs-rewards/redeem — redeem voucher/points benefit; idempotent.
- GET /api/rs-rewards/ledger — user ledger, scoped authorization.

## Data model
Campaign(id, rulesVersion, startsAt, endsAt, status, participationLimit, inventoryPolicy)
Claim(id, userId, campaignId, idempotencyKey, state, issuedAt, revealedAt)
Award(id, claimId, awardType, awardValue, status, expiresAt, rulesVersion)
LedgerEvent(id, awardId, eventType, actor, timestamp, metadata)
AuditRecord(id, campaignId, actor, action, timestamp, reason)

## State machine
Claim: CREATED -> ISSUED -> REVEALED -> (AWARD_ISSUED | NO_AWARD)
Award: ISSUED -> REDEEMED | EXPIRED | VOIDED
Terminal states cannot be reversed; corrections are new auditable events.

## Test checklist
- Duplicate claim and redemption requests.
- Concurrent requests and race conditions.
- Expired campaign, revoked campaign, exhausted inventory.
- Auth and ownership boundaries; admin role separation.
- Ledger integrity, audit trail, and privacy/retention.
- Accessibility, mobile layout, and reduced-motion behavior.
