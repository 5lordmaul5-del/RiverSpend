# RiverCloud Fixture Test Readiness — 2026-11-26

This is an authoring/readiness inventory only. No test execution, deployment, merge, runner activation, or live external service calls are performed.

## New behavioral fixtures authored
- Queue reconciliation: accepted-plan conversion, repeat/idempotency behavior, queue ID/digest mismatch fail-closed.
- Lifecycle audit: create and verify audit entry, direct approval bypass rejection, invalid transition rejection, audit tampering detection.
- Approval-bound lifecycle: atomic consume and audit, self-approval rejection, one-use token rejection, wrong-secret rejection.

## Important caveats
- These fixtures are authored, not executed. Their assumptions and actual runtime behavior remain unverified.
- Authentication and approver/consumer identity remain labels until a real authentication provider and verifier are integrated.
- Fixture secrets are test-only constants and must never be reused in deployment.
- The tests use temporary local filesystem state; production persistence, locking, backup, recovery, and ingress trust are not covered.
- Runner/execution remains disabled. The fixtures do not invoke deployment commands or connect to staging.

## Suggested evidence sequence (requires explicit approval before execution)
1. Run the isolated RiverCloud fixture suite in a disposable environment.
2. Review failures and test assumptions before any implementation changes.
3. Add route-level parity fixtures with mocked ingress/authentication and isolated state.
4. Test persistence recovery, lock contention and crash recovery using controlled fault injection.
5. Independently verify authenticated approval identity and proxy header trust.
6. Obtain separate authorization for any staging rehearsal. Keep deployment and runner gates closed until evidence is reviewed.
