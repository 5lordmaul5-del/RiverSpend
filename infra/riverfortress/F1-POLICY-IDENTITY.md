# RiverFortress F1 — Policy & Identity Contract

Status: design contract and test plan only. No live identity provider, credentials, production routes or runner execution are connected.

## Security principles
- Default deny: no action unless an explicit policy permits it.
- Identity is not inferred from a request, username, email, client-supplied header or approval token.
- Every decision binds a verified actor, action, resource/target, policy version and time.
- Least privilege and separation of duties; no implicit administrator bypass.
- Revocation must invalidate sessions and outstanding approvals.
- Decisions and denials are auditable, with minimized data.

## Roles (proposed, not deployed)
- Owner: administer system policy and identities; cannot silently override approval/replay controls.
- Security Admin: manage identity and policy; cannot execute privileged jobs alone.
- Operator: initiate permitted jobs and view their own job details.
- Approver: approve specific, fully bound plans; cannot approve own request.
- Auditor: read audit and evidence only; no write or execution.
- Read-only: limited status visibility.
Role names alone confer no permissions: scopes, target and action policy must also match.

## Decision inputs
Require verified immutable actor ID; active session; session assurance level; assigned role; explicit scope; action; target; policy version; request ID; and applicable approval evidence. Missing, malformed, expired or contradictory inputs fail closed.

## Approval binding
Approval records bind: actor ID of requester; distinct approver actor ID; action; exact target; plan/commit digest; policy version; expiry; unique nonce; and state (unused/consumed/revoked). A token is one-use, atomically consumed, never reusable. Reject changed plans, targets, actors, expired tokens, self-approval and replay.

## Session and revocation
Sessions are short-lived, secure, and server-validated. Logout, account disablement, role removal, policy change, security incident and explicit revocation invalidate affected sessions and pending approvals. Do not rely solely on browser cookie expiry. Provider-specific OIDC/MFA implementation remains future work.

## Policy evaluation order
1. Validate request shape and size.
2. Establish trusted actor and session.
3. Check account/session status and revocation.
4. Resolve policy version and role/scope.
5. Check action + target allowlists.
6. Enforce separation of duties and approval requirements.
7. Verify approval binding, expiry and nonce.
8. Atomically consume approval where applicable.
9. Record minimized decision evidence.
10. Only then may a future authorized executor accept the request. F1 does not enable execution.

## Test acceptance matrix
- Missing actor/session => deny.
- Unknown role/action/target => deny.
- Read-only attempts write => deny.
- Operator outside scope => deny.
- Requester self-approves => deny.
- Wrong plan digest, target, action or policy version => deny.
- Expired, revoked or already-consumed approval => deny.
- Concurrent replay => exactly one consume succeeds.
- Revoked session/account => deny even if cookie/token appears otherwise.
- Audit record contains required decision metadata but no credential, secret or unnecessary personal data.

## Implementation gate
Before provider integration or execution: threat review; test fixtures; deterministic policy evaluator; atomic approval store; revocation path; independent audit sink; hostile and concurrency tests; and explicit authorization. This document is not a production control or certification.
