# RiverCloud Audit Integrity & Registry Coherence Plan — 2026-11-26

Status: source-only design checklist; no test execution or runtime changes.

## Audit integrity checks to implement/review
- [ ] Verify event chronology and monotonic ordering assumptions (timestamps alone are not authoritative ordering).
- [ ] Ensure append-only audit semantics at mutation boundaries; prohibit ordinary update/delete paths.
- [ ] Verify actor attribution is authenticated upstream and never inferred from untrusted display labels.
- [ ] Bind event records to stable job/request identifiers and approved operation digests.
- [ ] Define integrity mechanism (hash chaining or signed checkpoints) with explicit key lifecycle; avoid treating a plain hash as proof against privileged rewrite.
- [ ] Validate schema, bounds, and unknown-field policy for audit extensions.
- [ ] Ensure sensitive values are redacted before audit persistence and logs.
- [ ] Define retention, export, backup, and restoration checks.
- [ ] Test tampering, truncation, reorder, duplicate events, missing links, and invalid signatures in isolated fixtures.
- [ ] Document expected fail-closed behavior and operator recovery workflow.

## Registry/API consistency
- [ ] Shared request contract is enforced at every ingress.
- [ ] Authorization is evaluated against authenticated actor claims, not user-supplied headers without trusted ingress verification.
- [ ] Queue, engine, proxy, and lifecycle adapters map error codes consistently.
- [ ] Idempotency and operation digests remain stable across ingress routes.
- [ ] Runner/execution remains disabled until all gates are reviewed and explicitly approved.

## Gate status
This checklist is a planning artifact, not evidence that these controls exist or pass. Existing tests and authored fixtures remain unexecuted. No deployment, merge, runner activation, external service, or secret/config change is performed.
