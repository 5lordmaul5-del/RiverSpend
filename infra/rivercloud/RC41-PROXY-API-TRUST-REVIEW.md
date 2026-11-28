# RC-41 — Proxy/API trust boundary review (26 Nov 2026)

## Scope
Static review of the isolated RC-34 proxy-identity API and OAuth2 Proxy/Caddy Compose scaffold. This review does not configure a real identity provider, run containers, or claim end-to-end OIDC validation.

## Observations
1. **Identity header contract is not yet proven.** The API expects `x-forwarded-user` and `x-forwarded-groups`. The Compose configuration sets OAuth2 Proxy's `SET_XAUTHREQUEST` and `PASS_USER_HEADERS`, but the actual runtime forwarding contract for these exact headers has not been exercised against the pinned proxy image.
2. **Trusted network address is a critical assumption.** API authorization depends on the socket peer address matching `RIVERCLOUD_TRUSTED_PROXY_IP`. This must be confirmed at runtime within the deployed network and not merely inferred from Compose.
3. **Role mapping is local and permissive by configuration.** Group names map to roles via a configured map. Verify provider group claim, group allowlist, claim name and mapping alignment before deployment; missing/unmapped groups should remain fail-closed.
4. **Actor reference uses unkeyed SHA-256.** This hides literal identifiers but is not anonymization and may be susceptible to guessing. Treat it as pseudonymization only. A keyed HMAC with managed secret and rotation plan would be stronger.
5. **OIDC remains a scaffold.** No provider login, MFA, session revocation, header-stripping behavior, or end-to-end API RBAC has been verified.

## Required RC-41 acceptance checks
- Pin proxy image and verify its documented header behavior against runtime integration tests.
- Confirm the proxy overwrites/strips client-supplied identity headers rather than trusting them.
- Verify exact forwarded user and group headers and multi-group behavior.
- Verify the API is reachable only from the proxy container on the intended network.
- Exercise viewer, auditor, operator, admin and unmapped group paths.
- Verify missing, malformed, duplicate and spoofed identity headers fail closed.
- Confirm no detailed job data or identity leakage in health responses/logs.
- Record tests and evidence at the exact commit before calling OIDC/RBAC complete.

## Safety
No live deployment, merge, provider registration, secret/credential change, execution runner activation, infrastructure provisioning, or spending performed.
