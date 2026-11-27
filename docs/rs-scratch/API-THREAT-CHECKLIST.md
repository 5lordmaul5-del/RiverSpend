# RS Scratch — API Contract and Threat Checklist

Prototype contract; no live routes or prize issuance implemented yet.

## Routes
- POST /api/rs-scratch/eligibility — authenticated user, campaign ID; response eligibility + reason.
- POST /api/rs-scratch/claim — authenticated user, campaign ID, idempotency key; creates claim only after server validation.
- GET /api/rs-scratch/claims/:id — only owner or authorized admin.
- POST /api/rs-rewards/redeem — authenticated user, award ID, idempotency key; atomic redemption.
- GET /api/rs-rewards/ledger — owner-scoped, paginated, redacted event history.
- Admin routes must use role-based authorization and log all changes.

## Request/response rules
- Reject unknown campaign IDs, expired/inactive campaigns, attempts beyond cap, invalid payloads.
- Server computes participation eligibility. Browser cannot determine or assign rewards.
- Idempotency key required on mutating requests; replay returns the original result, not a second claim/award.
- Claim and redemption operations use transactions, row locks or equivalent serialization, and unique constraints.
- Do not return private user data or internal abuse signals to clients.

## Threat checklist
- [ ] Authentication and authorization on every route
- [ ] CSRF protection where cookie-based auth is used
- [ ] Input validation and schema versioning
- [ ] Rate limiting and abuse monitoring
- [ ] Duplicate/replay protection
- [ ] Concurrent claim/redeem protection
- [ ] Inventory reservation and rollback handling
- [ ] Admin MFA and role audit
- [ ] Ledger immutability / append-only DB permissions
- [ ] Secrets outside repository and browser bundles
- [ ] Privacy minimization, retention policy and data export/deletion procedures
- [ ] Accessibility and reduced-motion option
- [ ] Legal review of promotion mechanics, terms, eligibility, odds and fulfillment before launch

## Prototype launch gate
No public activation, paid participation, cash conversion, or real prizes until legal, security, operational, and platform reviews are complete.
