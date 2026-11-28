# RC-409 — RiverSSAI recovery acceptance matrix

Purpose: define the evidence required before calling the local supervised RiverSSAI worker/recovery path operationally accepted. This document does not claim production acceptance.

## CI-covered gates (automated)
- [ ] Restricted child/supervisor unit suite
- [ ] Supervised HTTP suite
- [ ] Local HTTP and JWT suites
- [ ] Authenticated intake suite
- [ ] Persistent payload ledger suite
- [ ] Integrated worker suite
- [ ] Contract bridge suite
- [ ] Consolidated RC-407 runner passes
- [ ] RC-408 preflight confirms every required suite exists

## Recovery acceptance (controlled test environment only)
- [ ] Simulate worker interruption while a task is leased.
- [ ] Confirm lease expiry is detected without manually editing the ledger.
- [ ] Confirm re-claim is fenced against the previous worker token/epoch.
- [ ] Confirm stale worker cannot commit a result after lease rotation.
- [ ] Confirm retry limit and terminal failure state are observable.
- [ ] Confirm audit/ledger records distinguish attempt, recovery and terminal status.
- [ ] Confirm restart preserves durable state and does not duplicate completed work.
- [ ] Confirm backup restore drill uses synthetic data and validates integrity/authentication.
- [ ] Capture logs, run identifiers, test environment and evidence; redact secrets.

## Explicitly not accepted by CI alone
CI success is not proof of OS-level sandboxing, production host confinement, real identity provider integration, off-host backup/retention, passphrase recovery, operational monitoring, incident response, or production restore readiness. These require separate review and controlled environment evidence.

## Stop conditions
Stop and seek authorization before production data, real credentials, external service provisioning/spending, deployment/cutover, irreversible action, or changing live configuration.
