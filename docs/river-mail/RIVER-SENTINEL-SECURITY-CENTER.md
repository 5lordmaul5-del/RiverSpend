# River Sentinel Security Center — RC222

## Scope
Security analytics for RiverMail and later opted-in connected accounts, centered on threat signals rather than covert email surveillance.

## Admin view
The eventual privileged console should display service health, anonymized/aggregated threat trends, abuse reports and incident workflows. Account-level data is only exposed to the account owner, or to a support/security operator under a narrowly scoped, time-limited, documented authorization and immutable audit trail.

## Account view
Session/device list, login anomalies, suspicious forwarding, application grants, phishing reporting and security-setting changes. Provide MFA, session revocation and app-permission revocation when implemented.

## Architecture target
Authenticated event producers -> schema validation -> tenant-scoped event store -> rules/scoring -> user alert + aggregate admin view -> audited response workflow. Do not ingest message bodies by default. Optional analysis should be explicit, bounded, transparent and minimize retention.

## Prototype status
Demo dashboard and explainable scoring rules/tests. No live mailbox, email-content inspection, real alerts, integrations, identity/access system or admin panel backend. Tests are authored but not executed in this change.
