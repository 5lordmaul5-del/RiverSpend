# RiverCloud Audit Event Semantics Review — 2026-11-26

## Scope
Read-only source review of `infra/rivercloud/rc11-state.mjs` on `feat/rivercloud-unified-policy-2026-11-26`. This review does not execute fixtures, mutate runtime state, or enable the runner.

## Observed behavior
- State schema includes a generic `events` array.
- `addJob` appends a `job_created` event after inserting the job.
- `setJobState` appends a `job_state_changed` event with from/to values.
- `storeApproval` appends `approval_issued`.
- `consumeStoredApproval` appends `approval_consumed`.
- State validation bounds the core events array at 10,000 records and checks record shape.
- Events are serialized as part of the same state snapshot transaction; the reviewed source does not demonstrate a separate immutable audit store, cryptographic chaining, authenticated actor attribution, retention/export, or externally anchored integrity proofs.

## Risks / unresolved
1. Events are ordinary records within the mutable snapshot; privileged snapshot rewrite could alter, remove, reorder, or replace event history.
2. Event records do not consistently carry an authenticated actor identity in the reviewed functions.
3. Event timestamps alone cannot establish chronology or tamper resistance.
4. Capacity bounds create a potential lifecycle/retention design issue; no safe archive or rotation contract is established here.
5. Recovery semantics for audit history and snapshots require explicit reconciliation and evidence.

## Proposed fixture matrix (design only; not executed)
- Baseline: each relevant mutation appends the expected event type and job/token reference.
- Tamper: altered payload, removed event, reordered events, duplicate event, and forged event identifier.
- Cross-reference: event references absent job/approval; job or approval mutation lacks corresponding event.
- Schema: malformed record, unknown fields where strictness is required, oversized event array.
- Actor: anonymous, malformed, unauthenticated, and verified actor attribution cases.
- Integrity: valid/invalid hash chain or signature; checkpoint verification; truncation detection; privileged rewrite threat model.
- Recovery: restore from snapshot plus audit archive; mismatch must fail closed and be surfaced as uncertain/inconsistent.
- Retention: archival/rotation preserves verifiable continuity and prevents silent loss.

## Acceptance criteria before any execution gate opens
- A documented event schema and stable identifiers.
- Authenticated actor attribution upstream of event creation.
- Explicit immutable/append-only storage or verifiable integrity mechanism with key lifecycle and anchoring strategy.
- Tests with independently reviewed expected results; execution explicitly authorized.
- Recovery, archive, and retention behavior verified in a non-production fixture environment.
- Runner and deployment remain disabled until all applicable gates are closed with evidence.

## Status
Review and fixture design only. No implementation of cryptographic integrity is claimed. No tests were run.
