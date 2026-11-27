# RC218 — RiverMail Plus & RS Spons Monetization

## Product tiers (illustrative, not launched/priced)
- RiverMail Free: mailbox basics, configurable and clearly labelled sponsored placements; user controls and privacy settings.
- RiverMail Plus: no sponsored placements; expanded mailbox/archive quota; advanced search and filters; aliases; folders/labels; attachment quota; priority recovery/support options as feasible.
- RiverMail Business: custom-domain mailboxes, team administration, shared quotas and policies, business features.
- RiverMail Ultra (future concept): larger storage and premium AI tools, subject to cost/security review.

## Storage/archive design
Storage quota is per account and measured in bytes. Message metadata, message body and attachment storage should be tracked distinctly. Archiving is not a substitute for backup. User can export and delete content subject to legal/operational policy. Storage limits, quotas, plans and pricing must be configurable; avoid hardcoded promises.

## RS Spons
Sponsored placements may appear in a separate clearly labelled surface, never disguised as messages. Frequency caps, advertiser review, campaign dates, reporting, consent/preferences, user feedback and safety checks. Do not scan private message contents for targeting by default; personalized targeting requires appropriate legal basis, clear controls and transparency. Privacy-friendly aggregate reporting only where appropriate.

## Integration
RiverSpendShop can advertise products/campaigns, but transactional messages remain separate from ads. Signals and RiverSSAI can show opt-in service notifications. Sponsored promotions should not be automatically inserted into private conversations or message bodies.

## Prototype plan
- Plan/catalog schema (configurable).
- Account usage/quota tracking design.
- Subscription state machine: free, plus, business, trial, past_due, cancelled; provider-agnostic, no payment processing.
- Sponsor campaign metadata and placement labels.
- Dashboard UI demonstration and documentation.

## No production claims
No actual payment billing, subscription enforcement, real mail transport, ad delivery, advertiser onboarding, authentication, privacy consent implementation or production deployment in this prototype. Pricing and quota figures are not final.
