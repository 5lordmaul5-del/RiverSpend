# RC-147 — API key store and RiverSSAI orchestrator security audit (read-only review)

Date: 26 November 2026
Reviewed branch: feat/river-api-contracts-key-core-2026-11-26
Reviewed head: 637c562daefec3d11eda6782a42f0f7827a1e071

## Scope
Static review of api-key-store.mjs, gateway-store-adapter.mjs, river-ssai-orchestrator.mjs and canonical-json.mjs. No production credentials, network endpoints, deployment or merge.

## Findings and recommended follow-up

### 1. Persistent key store is prototype-only — HIGH priority before real use
The file-backed snapshot contains key digests but is not encrypted at rest. Owner/private-mode checks and no-follow open safeguards are useful defense-in-depth but do not establish a production credential-management boundary. Use a dedicated secrets/key-management approach before issuing live keys.

### 2. Lock recovery after process interruption — MEDIUM
The exclusive lock is bounded by timeout, but a process crash can leave a lock file behind. The store fails closed after the timeout rather than automatically recovering. This is safer than blindly deleting a lock, but operational recovery needs a documented procedure and owner/identity verification; automated stale-lock deletion would itself need careful race analysis.

### 3. Filesystem race resistance — MEDIUM
The implementation explicitly cannot fully eliminate hostile local path/lock races. The directory component checks, O_NOFOLLOW and inode-aware lock unlink are defensive; they do not make a shared writable filesystem safe against a hostile local actor. Keep the store directory private and local, and do not treat it as multi-host storage.

### 4. Durability uncertainty after directory sync — MEDIUM
After snapshot rename, a directory-sync failure reports commit durability uncertain and commitApplied=true. Callers must not blindly retry a key creation or revoke operation as if nothing happened. This error should be surfaced distinctly and reconciliation performed by reading state.

### 5. Orchestrator is not a runtime — HIGH priority before production
The orchestrator produces plans only. It does not launch workers, enforce runtime concurrency or wall-clock execution limits, provide durable idempotency, or use a real approval service. These controls must be implemented and independently tested in a runtime before enabling execution.

### 6. Schema validation depth — FOLLOW-UP
The input-schema matcher enforces basic object/type checks, but array/object constraints are not recursively validated against nested schemas in the orchestrator itself. Registry schema validation may constrain definitions, but the runtime input validator should be expanded and tested for nested arrays/objects, string/number bounds, and resource limits before execution.

### 7. Idempotency durability and lifecycle — FOLLOW-UP
Orchestrator idempotency and mock gateway idempotency are memory-only. Capacity is bounded, but retention/eviction and durable replay semantics are not implemented. Do not imply replay guarantees across restart.

## Recommended acceptance gates
- Document operational recovery for uncertain commit and stale-lock situations.
- Add nested-schema validation tests and malformed-input tests before runtime activation.
- Add durable idempotency design (expiry, storage, conflict/replay semantics) before production.
- Add real approval service binding and audit trail, fail-closed.
- Add worker isolation, resource quotas, cancellation, deadline enforcement, rate limits, and monitoring before any execution.
- Security review and independent tests before live keys, external endpoints or production deployment.

## Status
Audit findings only. No source code was modified in the reviewed PR branch. No merge, deployment, live key or agent execution.
