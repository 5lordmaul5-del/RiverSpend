# RiverFortress F6 — IntegrityGuard verification contract

Status: Draft design/contract only. No active scanning, signing infrastructure, or production enforcement.

## Purpose
Define controls to verify that code, configuration, dependencies, artifacts, and deployment records are authentic, authorized, and consistent with approved baselines.

## 1. Integrity scope and inventory
- Identify protected assets: source, build artifacts, configuration, infrastructure manifests, dependencies, deployment metadata and recovery artifacts.
- Maintain an approved baseline with owner, version, timestamp, provenance and review record.
- Classify assets and define verification cadence/risk-based triggers.
- Exclude secrets and sensitive payloads from baseline manifests.

## 2. Artifact provenance and verification
- Require traceable source commit and build identity for releasable artifacts.
- Record build provenance, dependency inventory (SBOM where appropriate), and release approvals.
- Verify artifact hashes and signatures against trusted, independently controlled trust roots.
- Reject unknown, expired, revoked, mismatched or untrusted signatures/provenance.
- Avoid treating a checksum alone as proof of origin; pair integrity checks with trusted provenance.

## 3. Configuration integrity and drift
- Compare live or staging configuration against approved versioned baselines.
- Detect unexplained changes to permissions, routes, network settings, secret references, service definitions and deployment settings.
- Define authorized change windows and actor/approval metadata.
- Alert on drift; privileged changes require review and evidence.
- Never automatically overwrite drift without approved policy and recovery/rollback plan.

## 4. Dependency and supply-chain checks
- Inventory direct and transitive dependencies.
- Evaluate known vulnerabilities, maintenance status, licensing and provenance.
- Pin or constrain dependency versions; verify package integrity and trusted registries.
- Separate findings by severity, exposure, exploitability and impact.
- Track remediation owner, deadline, mitigation and closure evidence.
- Avoid blindly updating dependencies in production; changes require review and tests.

## 5. Verification policy
- Define verification methods, expected results, trust roots, key custody and revocation.
- Use independent trust root custody where feasible; signing keys must not be stored with signed artifacts.
- Treat verification failures as security events; privileged or deployment operations fail closed.
- Ensure verification service outage is detectable and cannot silently bypass checks.
- Document exceptions with scope, owner, expiration, approval and compensating controls.

## 6. Privacy-safe telemetry
- Record asset identifiers, baseline version, verification method, result, actor, timestamp, correlation ID and actionable finding metadata.
- Do not log secret values, full payloads, tokens or unnecessary personal data.
- Send sanitized findings to F3 Sentinel and retain evidence under approved policy.

## 7. Acceptance test matrix
- Modified artifact fails integrity/signature verification.
- Missing, revoked, untrusted or expired signature is rejected.
- Provenance does not match approved source/build identity.
- Unauthorized configuration drift is detected.
- SBOM/dependency inventory is generated and checked where supported.
- Vulnerability findings are triaged and tracked.
- Verification outage is surfaced; no silent bypass for privileged operations.
- Exception expiry and revocation are enforced.
- Logs are tested for sensitive-data leakage.
- Recovery restores are re-verified before reconnection.

## 8. Integration contracts
- F1 Policy/Identity: baseline change and exception approvals.
- F2 RiverVault: independent signing key custody and rotation.
- F3 Sentinel: sanitized verification findings and failure alerts.
- F4 ShieldWall: protect verification endpoints and bound request processing.
- F5 Recovery: restored artifacts/configuration must be verified before reconnecting.
- RiverCloud: release and configuration metadata must be traceable.

## 9. Readiness gate F6
Before operational implementation: asset inventory; baseline owners; signing/provenance design; trusted key custody; isolated tests; dependency/SBOM process; drift detection; exception policy; independent review; evidence retention; explicit authorization.

## Out of scope / not claimed
This contract does not perform scans, sign artifacts, establish trust roots, enforce drift detection, certify compliance, or deploy controls. Operational capability requires implementation, isolated testing, review and explicit authorization.
