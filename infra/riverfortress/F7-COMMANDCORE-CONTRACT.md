# F7 — RiverFortress CommandCore Contract

**Status:** design contract only  
**Layer:** F7 — Control-plane coordination and operator visibility  
**Parent:** F6 IntegrityGuard  
**Safety principle:** CommandCore coordinates and reports; it does not bypass the authorization, policy, approval, execution, or audit boundaries defined by F0–F6.

## 1. Purpose

CommandCore provides a unified, role-aware view of RiverFortress readiness, component health, incidents, pending approvals, dependencies, and evidence. It is the coordination plane for the Fortress layers, not a privileged backdoor.

## 2. Scope and non-goals

In scope:
- Consolidated status and readiness views for F0–F6.
- Component, dependency, event, alert, and approval summaries.
- Safe drill-down to sanitized evidence and audit references.
- Explicit action proposals, approval state, and execution-result reporting.
- Operator workflows, incident prioritization, and readiness gates.

Not in scope in this contract:
- Implementing a live dashboard, API, event bus, monitoring service, runner, or identity provider.
- Directly managing secrets or exposing secret values.
- Automatically executing privileged actions or silently changing configuration.
- Treating dashboard status as proof of control effectiveness.

## 3. Component model

CommandCore aggregates contract-defined status for:
- F0 Foundation and readiness gates
- F1 Policy & Identity
- F2 RiverVault
- F3 Sentinel
- F4 ShieldWall
- F5 Recovery & Resilience
- F6 IntegrityGuard

Each component record should include: stable identifier, contract/version, declared status, last verified timestamp, evidence reference, dependency list, freshness indicator, owner/role, and unresolved readiness gates. Status values must distinguish **not implemented**, **not verified**, **healthy (verified)**, **degraded**, **blocked**, **unknown/stale**, and **failed**. No status may be inferred as healthy merely from configuration or a successful heartbeat.

## 4. Dashboard and event model

Views should include:
- Overall readiness with per-layer status and gate counts.
- Incident/event timeline with severity, source, timestamps, and correlation IDs.
- Dependency map with missing, stale, or failed upstream dependencies.
- Approval queue showing action summary, target, scope, requester, expiry, and approval state.
- Recovery and integrity evidence summaries.
- Change history and audit-reference drill-down.

Events must be bounded, deduplicated where possible, time-stamped, source-identified, and correlation-linked. Event ingestion failure must be visible and must not be silently treated as normal health.

## 5. Access and action boundary

- Read-only access is the default.
- F1 identity and policy controls remain authoritative.
- CommandCore may request actions through approved interfaces only; it must never invoke a runner or service directly outside the F1/F0 policy chain.
- High-impact or irreversible actions require scoped, actor-bound, time-limited approval and replay protection.
- Approval must not be self-granted where separation of duties is required.
- Role restrictions, revocation, and least privilege apply to every view and action.
- Secret values, credentials, tokens, and private payloads must not appear in dashboard views, logs, exports, or notifications.
- Emergency actions remain governed by documented break-glass controls and post-action audit requirements.

## 6. Action lifecycle

1. Authorized actor submits a bounded action proposal.
2. CommandCore validates request shape, target, scope, freshness, and required dependencies.
3. Policy service determines authorization and approval requirements.
4. Approvals are collected and bound to the exact proposal hash/version.
5. The approved request is dispatched only through the designated controlled interface.
6. Result is reported as success, failure, timeout, or indeterminate; never assume success.
7. Evidence and audit references are recorded and surfaced.

If target state or result is indeterminate, CommandCore must not automatically retry potentially destructive actions. Require reconciliation or explicit safe retry policy.

## 7. API and resource bounds

Future APIs must use authenticated access, default-deny authorization, strict schemas, bounded payload sizes, pagination, rate limits, timeouts, correlation IDs, and versioning. Export endpoints must apply least privilege and data minimization. No unbounded query, fan-out, or event subscription is permitted.

## 8. Failure behavior and resilience

- Missing or stale component data is **unknown/stale**, never healthy.
- CommandCore outage must not disable component-level safety controls.
- Partial data must be labeled as partial.
- Failed event delivery, audit writes, policy checks, or approval verification must fail closed for privileged actions.
- UI/API availability must not be a dependency for emergency shutdown controls owned by their respective components.
- Avoid circular dependencies: CommandCore is a consumer of component status, not a foundational control for F0–F6.

## 9. Privacy, audit, and evidence

Audit records should include actor, role/session reference, action or view, target/scope, proposal and approval references, timestamps, outcome, correlation ID, and sanitized evidence references. Avoid collecting unnecessary personal data or secrets. Audit integrity and retention requirements are defined by the relevant Fortress contracts.

## 10. Acceptance test matrix

- [ ] Missing component data renders unknown/stale.
- [ ] Stale data cannot produce an overall healthy state.
- [ ] Read-only user cannot propose or dispatch privileged actions.
- [ ] Unauthorized, expired, revoked, replayed, or scope-mismatched approval is rejected.
- [ ] Approval binds to exact action proposal and target.
- [ ] Separation-of-duties policy is enforced.
- [ ] Secret and sensitive payload redaction is verified in views, logs, and exports.
- [ ] Action dispatch failure and indeterminate outcome are visible and do not trigger unsafe retries.
- [ ] Component outage does not bypass or weaken independent component controls.
- [ ] Event ingestion failure and audit failure are surfaced.
- [ ] API payload, pagination, rate, timeout, and export bounds are tested.
- [ ] Dashboard summary reconciles against source component evidence.
- [ ] Partial/stale data is labeled and does not imply readiness.

## 11. Readiness gates

- **CC0:** Contract reviewed and scope approved.
- **CC1:** Identity, roles, and policy integration verified.
- **CC2:** Component status schemas and freshness semantics implemented.
- **CC3:** Event ingestion, deduplication, correlation, and failure signaling tested.
- **CC4:** Read-only dashboard and evidence drill-down implemented and security-reviewed.
- **CC5:** Proposal/approval/dispatch lifecycle integrated with controlled interfaces and tested.
- **CC6:** Privacy, API bounds, audit integrity, resilience, and recovery tests passed.
- **CC7:** Independent review and operational runbooks completed.

A gate is not passed until supported by recorded evidence. This document alone passes no operational readiness gate.

## 12. Explicit current limitations

This PR adds only the design contract. No CommandCore dashboard, service, API, event bus, integrations, operational controls, or production changes are implemented by this document.
