# RC-157 — RiverFortress hardening roadmap

## Mission
RiverFortress is the defensive control and assurance layer for RiverSpend and RiverSSAI. This roadmap prioritizes prevention, containment, detection, recovery, and evidence—not offensive capability.

## Layers
1. Identity and access: least privilege, scoped service identities, short-lived credentials where supported, MFA for human administrators, explicit authorization checks.
2. Secrets: never commit secrets; encrypted storage and rotation procedures; redact logs and exports.
3. API and input protection: allowlisted schemas, bounded payloads, rate limits, quotas, validation and safe error responses.
4. Isolation: separate development, test and production; sandbox workers; deny-by-default network and filesystem access; no automatic production credentials in clones.
5. Supply chain: lockfiles, dependency review, provenance, reproducible builds where practical, vulnerability scanning and SBOM.
6. Runtime safeguards: health checks, watchdogs, circuit breakers, bounded retries, cancellation and resource limits.
7. Data protection: minimization, encryption at rest/in transit where supported, backup manifests, restore tests, retention and deletion policies.
8. Audit: structured events, actor/task correlation, tamper-evidence goals, restricted access, retention and alerting.
9. Incident response: severity matrix, isolation playbooks, credential rotation, evidence capture, recovery and postmortem.
10. AI governance: prompt/input boundaries, tool allowlists, approval gates for consequential actions, untrusted-output handling, evals and human override.

## Acceptance gates
- Every sensitive action has an authorization and policy decision.
- No secrets in logs, code, artifacts or clone snapshots.
- Resource and retry ceilings enforced in tests.
- Isolation and fail-closed behavior tested.
- Backup/restore and incident playbooks reviewed.
- Security findings are tracked, prioritized and closed with evidence.

## Staged implementation
F0 inventory and threat model; F1 secrets/identity; F2 API and worker containment; F3 audit/telemetry; F4 backup/recovery; F5 supply-chain and automated tests; F6 incident drills and independent review.

This is a design and backlog document only. It does not claim production controls are deployed or tested.
