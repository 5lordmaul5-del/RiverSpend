# RC-10 approval-bound prototype — hardening update

The prototype now uses a 32-byte cryptographically random nonce, HMAC-SHA256 binding to the job/project/profile/staging target/commit/plan digest, expiry, and transactional state-file consumption. Concurrent consume attempts are serialized by the RC-11 state transaction, so only one can mark a stored approval as used.

## Limits that remain

- The approver is still an unverified label. No OIDC provider or authenticated identity is integrated.
- The state store and lock are local prototype components, not distributed storage.
- The state lock can remain after a crash; recovery is manual and must be reviewed.
- No runner or deployment execution is connected.
- Never wire this prototype to production or treat its approval as a real security authorization.
