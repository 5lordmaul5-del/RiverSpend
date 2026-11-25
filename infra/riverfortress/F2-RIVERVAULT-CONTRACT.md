# RiverFortress F2 — RiverVault Secret Handling Contract

Status: architecture and acceptance criteria only. No vault service, secrets, keys, credentials or production systems connected.

## Objective
Define a protected lifecycle for credentials, API keys, tokens, signing keys and encryption material. Secret storage is not ordinary configuration or logging.

## Required principles
- Secrets never appear in source code, commits, client-side bundles, logs, telemetry, error messages, audit payloads or test output.
- No secret values in environment-specific manifests or public repository files. Runtime injection and managed storage are future implementation choices.
- Least-privilege access: services and users request only the secret identifiers and versions they are authorized for.
- Separate key-management material from encrypted secret data and backups.
- Encrypt in transit and at rest; use authenticated encryption and established libraries, not custom cryptography.
- Access, reveal, rotation, disablement and deletion actions produce sanitized audit events.
- Fail closed if vault access, authorization, key retrieval or integrity verification fails.

## Secret metadata (never secret value)
Record only necessary metadata: opaque secret ID, owner/service, environment, purpose, version, lifecycle status, creation/rotation timestamps, access policy reference, and sanitized audit reference. Avoid embedding secret values in metadata or reasons.

## Lifecycle
1. Create: policy-checked, validated, stored encrypted; value not returned after initial controlled handoff unless a specific safe design requires it.
2. Retrieve: verified identity, narrow scope, reason where appropriate, rate limiting and audit; never reveal to unauthorized callers.
3. Rotate: create new version; staged validation and rollback strategy; retire old version only after consumers migrate.
4. Revoke: immediate policy enforcement and access denial; invalidate dependent sessions/tokens where possible.
5. Delete: approval for high-impact secrets, retention-aware, auditable; backups and cryptographic key dependencies considered.
6. Recover: documented recovery and key-loss scenarios; test in isolated environments only.

## Key management
- Do not store master keys beside ciphertext or in the same backup.
- Use a managed KMS/HSM or equivalent isolated key custody when deployed; the current prototype has no such integration.
- Design for key rotation, separation of duties, limited key access and recovery procedures.
- Never print, commit, send in chat, or include keys in diagnostic bundles.
- Key compromise requires containment, rotation, impact analysis and revocation.

## Access controls
- Authenticate service and human identities independently.
- Bind requests to verified actor/service, environment, secret ID, action and policy version.
- Separate secret administration, approval and consumer access.
- Default deny; explicit allowlists only.
- Avoid broad wildcard grants and cross-environment access. Production secrets cannot be accessed by development/staging identities.
- Break-glass access must be time-limited, independently approved, monitored and reviewed.

## Threats and defensive requirements
- Repository leak: scanning, blocked commits, no secret values in fixtures.
- Log/error leak: structured allowlist, secret-safe exception handling, tests for accidental value leakage.
- SSRF/unauthorized service: strict route and destination controls; vault must not fetch user-controlled URLs.
- Replay/abuse: request nonce or idempotency, rate limits and revocation.
- Backup exposure: encryption, key separation, restricted access and restoration rehearsal.
- Compromised consumer: scoped credentials, short lifetime where supported, rapid revocation and monitoring.
- Insider abuse: separation of duties, audit integrity and review.

## Test acceptance criteria
- Unauthorized, unverified or revoked identity is denied.
- Cross-environment secret request is denied.
- Missing ID, invalid version or malformed request is denied.
- Secret values are absent from audit/log/error outputs.
- Concurrent rotation and retrieval have defined, safe behavior.
- Revoked secret is no longer usable through the vault's access path.
- Rotation does not silently overwrite history; version lifecycle is traceable.
- Backup cannot decrypt without separately controlled key material.
- Break-glass actions require approval, expiry and review.
- Failure of vault/key service does not fall back to plaintext or permissive mode.

## Deployment gate
Before implementation or live use: threat review; secret scanning; vetted cryptographic/key management; secure service identity; isolated integration tests; key rotation and recovery drills; audit validation; monitoring; and explicit authorization. This contract is not a functioning vault or security certification.
