# RiverCloud Behavioral Harness — Fixture-only design (2026-11-26)

## Purpose
Build repeatable behavioral evidence for policy, queue, lifecycle, audit and API contracts using disposable local fixtures. This harness is not an execution runner and must never call external deployment, build or production endpoints.

## Safety boundary
- Tests use temporary directories and fixture state only.
- No runner connection, shell deployment, remote build, external credential or production target.
- Test authoring does not imply execution. Run only after explicit authorization.
- Any test requiring authenticated identity or trusted proxy deployment remains a fixture/mock boundary until the ingress is independently configured and verified.

## Proposed behavioral layers
1. **Request/policy:** strict four-field request, immutable SHA, allowlisted repository/branch/target; reject unknown fields, accessors, symbols, invalid values.
2. **Queue/state:** digest idempotency, capacity, lock contention, malformed state, permissions, bounded state file, durability-uncertain commit handling.
3. **Lifecycle/audit:** create and transition ledger, transition rejection, approval issue/consume adjacency, one-use, expiration, self-approval, tamper detection, audit capacity.
4. **Reconciliation:** accepted queue record only, digest verification, redacted lifecycle digest, idempotent repeat, concurrent-create outcome, mismatch reporting.
5. **API parity:** same request rejection and error classes across direct and proxy endpoints; test authorization boundary and header spoofing assumptions in a simulated ingress.
6. **Recovery:** interrupted temp-file write, lock cleanup, corrupt ledger fail-closed, commit durability uncertainty. Recovery tests must use disposable fixture files and injected fault hooks rather than real interruption of live services.

## Integration blockers (must remain closed)
- Authenticated identity issuer/signature verification and revocation.
- Trusted proxy/ingress configuration and spoofed-header removal proof.
- Approval approver and consumer identities tied to authenticated principals.
- Queue/lifecycle/audit data-store recovery and operational backup/restore evidence.
- Runner isolation, restricted networking, secret handling and immutable artifact evidence.
- CI execution and reviewed evidence; no tests are claimed to have run in this source-only phase.

## Exit criteria
A reviewed fixture suite covers each layer; test execution is explicitly approved and completed; failures and evidence are recorded; remaining infrastructure gates are documented. Only then consider a controlled staging rehearsal, separately approved.
