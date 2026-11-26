# RC-148 — Static review of RiverSSAI/River API mock integration facade

**Scope:** Read-only review of PR #103 patch. This audit records findings and acceptance gates; it does not alter runtime code.

## Findings
- **F-1 Idempotency not wired into facade (high priority before exposure):** the separate primitive is not composed into invoke(), so repeat requests are not deduplicated and quota/provider work can repeat. Gate: tenant+actor+request idempotency, atomic durable reservation and settlement.
- **F-2 Quota is process-local:** the Map is not durable or cross-instance atomic. Gate: shared atomic/transactional storage and concurrency tests.
- **F-3 Idempotency primitive prototype risks:** JSON.stringify payload digest is property-order-sensitive and lacks strict data validation; pending entries may be pruned under capacity pressure, potentially allowing duplicate operations. Gate: canonical bounded JSON, structured keys, safe pending eviction, durable replay.
- **F-4 Timeout is a Promise race:** AbortSignal cancellation depends on adapter cooperation; ignored signals can leave work running. Ambiguous provider outcomes need reconciliation, not blind retries.
- **F-5 Audit best-effort and incomplete:** sink errors are swallowed and early denials/validation/quota returns are not uniformly audited; outcome categories are coarse. Gate: durable redacted audit policy and comprehensive event coverage.
- **F-6 Model alias not allowlisted:** caller-provided model string reaches injected provider. Gate: server-configured provider/model allowlist, never arbitrary endpoints.
- **F-7 Provider response metadata is not fully validated:** output character length is checked, but provider/model metadata and structured response schema/byte limits are not.
- **F-8 Test coverage gaps:** no facade-wired replay, concurrent quota, provider ignoring cancellation, durable recovery, audit coverage on denials, model allowlist, or HTTP/auth middleware tests.

## Positive controls
Verified identity context is used; body fields outside the allowlist are rejected; key validation is scoped to tenant and inference; provider call follows authorization; bounded prompt/model/token/output, timeout race and AbortSignal; generic provider errors and allowlisted audit fields. No HTTP listener, shell/tools, live credentials, deployment or production wiring.

## Acceptance gates
1. Wire durable idempotency and atomic quota reservation/settlement; prevent replay duplicate dispatch.
2. Allowlist model/provider configuration; define hard timeout/cancellation and bounded response bytes.
3. Validate provider response schema and metadata; deterministic fault injection.
4. Audit all outcomes with redaction and durability policy.
5. Add concurrency, replay, tenant isolation, cancellation, storage-failure, restart/recovery tests.
6. CI and independent review before merge or connected staging.

**Disposition:** useful isolated mock seam; not production-ready. Documentation review only.