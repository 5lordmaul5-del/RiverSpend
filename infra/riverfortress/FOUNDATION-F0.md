# RiverFortress — Foundation Security Architecture (F0)

Status: architecture and policy foundation only. This document does not enable services, change production, or authorize deployment.

## Mission
RiverFortress is the security foundation for RiverCloud and RiverSpend: layered protection, explicit trust boundaries, fail-closed defaults, evidence-based readiness, and recoverability.

## Core principles
- Default deny; least privilege; separate identities for humans, services and workloads.
- No production operations from development/test branches.
- No secret values in code, logs, audit payloads, tickets or test fixtures.
- Security controls must be testable and observable; readiness claims require evidence.
- Fail closed on missing configuration, identity, policy, integrity, backup or isolation.
- Protect the protection system: change control, versioning, independent review and rollback.

## Layers
1. **Fortress Gate (edge):** TLS, rate limits, request-size/time bounds, allowlisted routes, no direct upstream exposure.
2. **Fortress Identity:** OIDC, MFA, actor binding, short-lived sessions, revocation and device/session controls; not yet implemented.
3. **Fortress Policy:** route/action RBAC plus project/target allowlists; deny by default; approvals bound to actor, plan, commit and target.
4. **Fortress Queue & State:** atomic state transitions, idempotency, locks, durable audit; prevent replay and concurrent approval consumption.
5. **Fortress Runner:** disabled until disposable sandbox, immutable images, resource limits, network egress restrictions, no host socket/privileged mode and credential isolation.
6. **Fortress Data:** encryption at rest/in transit, key separation and rotation, access logging, retention and deletion controls.
7. **Fortress Backup:** encrypted backups, immutable/off-site copy, integrity verification, restore into isolated target, rehearsed RPO/RTO.
8. **Fortress Audit:** schema allowlist, redaction minimization, hash integrity, signed delivery, receiver authentication, replay protection and independent retention.
9. **Fortress Monitoring:** alerting for auth/policy failures, unusual activity, drift, backup failures, worker isolation and service health.
10. **Fortress Supply Chain:** SBOM, dependency pinning, image digest pinning, vulnerability scanning, provenance and reproducible release evidence.

## Readiness gates (all required)
- G0: threat model, inventory, owners, boundary diagrams.
- G1: identity/MFA, RBAC, revocation and actor-bound approval tested.
- G2: restore resilience, encrypted off-site backup, integrity and recovery drills.
- G3: runner isolation verified using hostile workloads and egress tests.
- G4: audit pipeline privacy, replay protection, delivery and independent storage verified.
- G5: SBOM/scans, digest pinning, patch/rollback process, operational monitoring.
- G6: staging rehearsal, incident-response runbook, performance and failover evidence.
- G7: independent review and explicit written authorization before production rollout.

## Incident response
Containment: disable approvals and runner; isolate affected service; preserve audit evidence. Do not delete logs or blindly restore over live data. Recovery is performed into a separate clean target, integrity checked, reviewed and explicitly authorized.

## Implementation roadmap
F0 Architecture and threat model (this document).
F1 Policy/identity contract and test suite.
F2 Hardened restore streaming extractor and race-resistant path handling.
F3 Audit envelope schema, privacy controls and replay defense.
F4 Runner sandbox proof-of-concept in disposable environment.
F5 Monitoring, SBOM and operational runbooks.
F6 Independent staging review; no production eligibility until all gates pass.

## Current state
RiverCloud remains a prototype. Runner execution is disabled. Identity/RBAC, off-site encrypted backup, external audit delivery, sandbox enforcement and production monitoring are not complete. This foundation is a plan and security contract, not a certification or a guarantee.
