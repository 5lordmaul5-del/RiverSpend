# RiverSSAI ↔ River API integration contract (draft)

**Status:** design-only, isolated branch; no service wiring, credentials, production data, merge or deployment.

## Goal
Define a narrow integration seam so RiverSSAI can call the River API gateway without coupling provider/runtime internals to key-management storage. The current RiverSSAI provider adapter and API key manager remain prototypes on separate PRs.

## Trust boundary and tenant identity
- The gateway MUST derive tenant identity from verified authentication (OIDC/session/service identity), never from a request body, query string or untrusted header.
- API key validation must be performed against the verified tenant and requested scope. API keys are not substitutes for caller identity.
- Keys are secrets: reveal only at creation/rotation; hash at rest; never log, audit or return plaintext or hashes.
- Use explicit scopes; for inference calls require `inference`. Deny by default. Revocation must take effect at the gateway's defined consistency boundary.
- No execution tools, shell, arbitrary URL fetch or specialist side effects are enabled by this contract.

## Proposed minimal request
```json
{
  "requestId": "server-generated-or-validated-id",
  "task": "bounded user prompt",
  "model": "configured-model-alias",
  "maxOutputTokens": 512
}
```
Tenant, actor, key ID, authorization and audit metadata are server-derived, not client supplied.

## Proposed gateway response
```json
{
  "requestId": "request-id",
  "status": "accepted-or-completed",
  "provider": "adapter-name",
  "model": "configured-model",
  "output": "bounded response",
  "usage": {"inputTokens": null, "outputTokens": null},
  "executionEnabled": false
}
```
Do not fabricate token counts if the provider does not supply them.

## Required guardrails
1. TLS outside local development; strict endpoint allowlist and provider adapter boundary.
2. Request/output size caps, bounded timeout, cancellation, concurrency limits and rate/quota checks.
3. Schema validation and deny unknown fields; reject malformed inputs before provider invocation.
4. Redacted audit: request ID, verified tenant/actor, key ID, scope, decision, duration, outcome; no prompt/output or key material by default.
5. Persistence adapter interface must support transactional key rotation/revocation and concurrency-safe quota/rate enforcement; the current in-memory prototype is not adequate for multi-process use.
6. Error responses should be stable, generic and non-leaking; detailed errors belong in redacted internal diagnostics.
7. Idempotency and duplicate-request policy to be defined before externally exposing inference routes.
8. Integration tests must prove tenant isolation, revoked-key denial, missing-scope denial, quota/rate enforcement, timeouts, provider failure handling, output caps and audit redaction.

## Staged implementation
- Stage A: contract tests and mock gateway/provider (no real inference).
- Stage B: adapter interface and authenticated caller-context abstraction; mocked verifier in tests only.
- Stage C: local-only Ollama integration behind explicit configuration, no network/execution tools.
- Stage D: durable storage, transactional quota, operational monitoring and deployment hardening, reviewed independently.
- Stage E: Signals and Shop consume gateway only after their own service identities, scopes and integration tests exist.

## Acceptance criteria for a future connected slice
- Tests pass and include negative security cases.
- Verified identity context is injected by trusted middleware and cannot be spoofed by request payload.
- API key store and audit persistence are durable, concurrency-safe and recovery-tested.
- Provider configuration is allowlisted and secrets managed outside repository.
- A staging test is performed with approved credentials; no production rollout implied.

## Current verified baseline
- RiverSSAI branch PR #99 contains a bounded local-only Ollama adapter and core tests; CI evidence reported successful in recent runs.
- River API branch PR #100 contains a bounded in-memory key-management prototype; CI evidence reported 10/10 tests passing.
- These prototypes are separate, not connected, and are not production-ready.
