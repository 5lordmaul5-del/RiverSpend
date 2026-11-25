# RiverFortress F3 — Sentinel Detection & Incident Response Contract

Status: design contract and detection catalogue only. No live monitoring, network inspection, alerting or automated containment is connected.

## Objective
Define how RiverFortress detects suspicious activity, creates useful alerts, protects evidence and coordinates safe incident response.

## Detection sources (future integrations)
- Authentication: failed/successful logins, MFA failures, session creation, unusual session revocations.
- Authorization: denied policy decisions, role/scope changes, approval failures and replay attempts.
- Vault: secret access, unusual retrieval volume, rotation, revocation and failed access.
- Infrastructure: service health, configuration drift, unexpected process/port, resource exhaustion.
- Runner: attempted enablement, sandbox violations, unexpected egress, resource-limit violations (runner currently disabled).
- Backup: failures, integrity mismatch, restore activity and deletion attempts.
- Audit: sequence/hash validation failure, sink outage, missing event streams.
- Supply chain: dependency/image changes, integrity mismatch and untrusted artifact.

## Event data minimization
Use a strict schema/allowlist. Include event type, timestamp, actor/service identifier (opaque), resource ID, environment, outcome, correlation ID and severity. Do not include passwords, tokens, secret values, full request bodies or unnecessary personal data. Sanitize untrusted strings.

## Alert priority
- Critical: credible compromise, integrity breach, unauthorized privileged access, key exposure, repeated replay or runner escape indicator.
- High: suspicious privilege/identity changes, audit-chain discontinuity, backup tampering, policy bypass attempts.
- Medium: unusual failure rates, unexpected service/config changes, elevated resource consumption.
- Low/info: routine events and normal lifecycle signals.
Severity must be contextual and adjustable; avoid treating every failure as compromise.

## Detection and alert rules (initial catalogue)
1. Login/MFA failure burst across account or source -> rate-limited alert, adaptive controls; avoid exposing account existence.
2. Privileged role or policy change -> immediate notification and independent audit evidence.
3. Approval replay, mismatch or self-approval attempt -> denial and alert.
4. Vault access denied or unusual retrieval pattern -> alert, review and possible revocation.
5. Audit integrity or sequence failure -> critical alert; stop dependent privileged workflows.
6. Backup integrity/verification failure or unexpected deletion -> high/critical alert and preserve evidence.
7. Service health or resource threshold breach -> alert and operator investigation.
8. Unexpected configuration/port/process drift -> alert, quarantine proposal and evidence capture.
9. Runner execution or enablement while disabled -> critical alert; deny and investigate.
10. Egress or sandbox violation (when sandbox exists) -> deny, preserve sanitized evidence, stop job if safe.
11. Security scan/provenance failure -> block promotion/release.
12. Alert delivery failure -> secondary health signal; do not silently suppress.

## Response actions
Detection is not automatic containment. Proposed response tiers:
- Tier 0: log and notify.
- Tier 1: rate-limit or temporarily deny the specific request.
- Tier 2: revoke a session/token or isolate a component only under predefined, tested policy.
- Tier 3: emergency containment requiring explicit authorization unless a narrowly defined, tested safety mechanism is separately approved.
Avoid destructive actions; preserve logs and snapshots where safe. No automated shutdown or live remediation is implemented by this document.

## Incident playbook
1. Confirm alert and severity; check signal reliability.
2. Preserve sanitized evidence and timestamps; avoid copying secrets.
3. Identify affected actor, component, environment and scope.
4. Apply approved containment with recorded authorization.
5. Revoke compromised sessions/keys as applicable.
6. Restore only from verified known-good artifacts/backups.
7. Validate system integrity and monitoring.
8. Record impact, root cause, actions and lessons.
9. Review and improve detection rules and test scenarios.

## Acceptance tests (future implementation)
- Synthetic events trigger their expected rules and priorities.
- Suppression/rate controls do not hide critical alerts.
- Untrusted event text is safely sanitized.
- Alert payloads contain no credentials or secret values.
- Integrity failure disables/blocks dependent privileged actions.
- Disabled runner cannot execute and attempts produce alerts.
- Alert transport outage is detected independently.
- Revocation/containment decisions are logged and actor-bound.
- Rules and thresholds are versioned and testable.

## Readiness gate
Before live monitoring: define data retention/privacy, source inventory, secure transport, alert recipients, incident ownership, false-positive tuning, failure handling, independent audit, staged integration and explicit authorization. This contract is not a deployed Sentinel or guarantee of detection.
