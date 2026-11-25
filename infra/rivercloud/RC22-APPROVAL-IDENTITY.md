# RC-22 — identity-bound approvals and separation of duties

RC-22 adds an opt-in approval helper that accepts identity claims only through the RC-13 validation gate and requires the `approve_jobs` permission before issuing or consuming an approval.

- Identity claims must include configured issuer/audience, bounded timestamps and known roles.
- The caller must supply a verification callback that returns `true` only after verifying trusted provenance/signature. The module does not implement JWT/OIDC cryptographic verification, fetch JWKS, or authenticate an HTTP session.
- Approval records store a stable, non-reversible label derived from issuer and subject, rather than a caller-supplied free-form approver name.
- When the identity-gated consumption helper is used, the same identity that issued the approval cannot consume it (separation of duties). A different authorized identity may consume it once, with the existing transactional one-use guard.
- Direct legacy `consumeApproval` now requires a non-empty `consumerIdentity` label and rejects matching approver/consumer labels, preventing silent omission of the separation-of-duties check. This label is still caller-supplied and unverified; the direct helper is not an authentication boundary.
- No server route is wired to RC-22 yet.

Reproducible command:

```sh
node --test infra/rivercloud/rc22-approval-identity.test.mjs
```

This is a helper/test increment only. It is not a real OIDC provider integration or a production authorization boundary.
