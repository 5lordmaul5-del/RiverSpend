# RC-13 — identity and authorization foundation

## Included prototype
- Strict claim-shape, issuer/audience, time-window and role validation.
- Authentication is accepted only when an external verifier callback returns true; the default is deny.
- Role vocabulary: owner, admin, operator, auditor, viewer. A basic permission map is documented in code.
- Identity is a subject within an issuer; roles are deduplicated.

## Required before real use
1. Integrate a vetted OIDC provider; do not implement password storage or crypto ourselves.
2. Verify signature, issuer, audience, algorithm, nonce, and token lifecycle in provider middleware.
3. Require MFA for privileged roles; secure recovery and session revocation.
4. Bind approvals and audit records to authenticated issuer/subject, not a client-supplied label.
5. Enforce least privilege, deny by default, CSRF protections for browser sessions, secure cookies, rate limiting and authorization on every server route.
6. Review privacy, logging, retention and incident response.

## Limitations
This is an isolated validator prototype; its tests are included in the verified RiverCloud CI suite (runs #275/#276 and report-only #277/#278, 124/124). It is not an authentication system, does not verify cryptographic tokens by itself, and is not wired to production routes. Deployment/execution remains disabled.
