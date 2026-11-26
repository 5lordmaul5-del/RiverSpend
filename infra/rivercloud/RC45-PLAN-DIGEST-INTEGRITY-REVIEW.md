# RC-45 — Lifecycle plan integrity boundary review

Date: 2026-11-26
Scope: isolated RiverCloud branch; static review only. No execution, deployment, merge, or production change.

## Finding
The RC-17 atomic lifecycle prototype stores a caller-supplied `digest` beside the redacted persisted `plan`. Creation validates digest shape (64 hex characters) but does not derive it from the canonical plan representation. The audit chain binds the digest field and lifecycle transitions to that digest, but it does not prove that the persisted plan content corresponds to the digest.

This is not a demonstrated exploit against a deployed service; RC-17 is a prototype and the execution path remains disabled. It is a design-integrity gap to close before plan approval or execution is relied upon.

## Risk
A caller or future integration could supply an arbitrary valid-looking digest with a plan, or later alter plan data without an audit-chain mismatch if only lifecycle/audit fields are checked. The approval binding would then bind to the digest string, not necessarily to the actual plan content.

## Recommended remediation gate
1. Define one canonical serialization for the approved plan (including explicit treatment of redaction, ordering, types, and unsupported values).
2. Compute the digest inside the trusted lifecycle boundary; do not accept it as authoritative caller input.
3. Persist the canonical plan representation and recompute/verify its digest during reads and before approval consumption or execution.
4. Ensure redaction does not change the meaning of the plan that is hashed; preferably hash the exact execution payload and store a separately sanitized display representation.
5. Add regression tests for digest mismatch, post-creation plan mutation, canonicalization edge cases, and approval consumption against a changed plan.
6. Keep execution disabled until these checks and authentication/authorization integration are independently verified.

## Evidence reviewed
- `infra/rivercloud/rc17-atomic-lifecycle.mjs`: `createLifecycleJobAtomic`, audit verification and `readAtomicLifecycle`.
- `infra/rivercloud/rc17-atomic-lifecycle.test.mjs`: lifecycle/audit integrity test coverage.
- `infra/rivercloud/rc11-state.mjs`: atomic state transaction mechanism.

## Status
Static review finding documented. No code or tests were changed in this brick. CI status not assessed for this commit.
