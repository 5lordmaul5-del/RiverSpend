# RiverCloud Identity / Approval / Queue Boundary Review

Source review on 2026-11-26. This is a design-level review, not runtime validation.

## Observed source behavior
- RC-13 validates claim structure, issuer/audience/time/roles and delegates signature verification to a callback. The callback defaults to false. Claims alone are not authenticated.
- RC-34 proxy API trusts identity/group headers only after a remote-address comparison against a configured proxy address. This assumes the proxy is reachable only through the intended network path, strips caller-supplied identity headers, and reliably supplies authenticated headers. Those assumptions are not verified in this repository review.
- RC-34 maps groups to roles and derives a pseudonymous actor reference for queued plans. Role permissions are checked per route.
- Approval-bound uses HMAC, nonce, expiry, binding checks and atomic consumption. Its approver and consumer strings remain labels, not authenticated identities, until upstream identity is integrated.
- RC-17 records approval issuance/consumption and state transitions in the audit chain; source verification checks integrity and state consistency.
- Reconciliation now verifies queue digest, ID and lifecycle redacted-plan digest independently, and checks existing/concurrent entries.

## Integration gates (must remain closed)
1. Proxy configuration must prove trusted ingress, header stripping/replacement, authenticated identity source, and network isolation.
2. Authentication provider must validate signatures, issuer, audience, key rotation and revocation; never accept caller-supplied claims directly.
3. Approver and consumer labels must be bound to authenticated immutable identities and authorization policy.
4. Approval must be bound to the exact immutable plan, environment, commit and policy version; expiry and one-use consumption must be verified.
5. Queue-to-lifecycle reconciliation requires behavioral tests for digest domains, mismatches, duplicates, concurrent writes and corrupted ledger.
6. Execution remains disabled until separate review, tests, threat-model and explicit authorization.

## Test status
Tests have not been executed. This document records source observations and outstanding assumptions only.
