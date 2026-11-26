# RiverSSAI ↔ River API integration test plan

**Scope:** Stage A/B of the integration contract. Tests are designed to use fake identity verification, a mock provider and in-memory stores only. They do not authorize real keys, network inference, deployment or production changes.

## Test fixture
- Gateway facade receives an injected identity verifier (fake only in tests), key manager and provider adapter.
- Every test creates a fresh tenant, actor, key and request ID.
- Provider stub records invocation count and arguments, and can return, fail or delay deterministically.
- Audit assertions check field allowlists and verify sensitive payloads are absent.

## Required test matrix

| Case | Setup / request | Expected |
|---|---|---|
| Verified identity | verifier supplies tenant and actor | authorization uses verifier result |
| Tenant spoofing | payload/header attempts tenant override | ignored or rejected; verified tenant remains |
| Missing identity | verifier rejects/returns no context | deny before key/provider |
| Missing key | no API key | deny; provider not called |
| Wrong tenant | key belongs to other tenant | deny; provider not called |
| Missing scope | valid key without inference scope | deny; provider not called |
| Revoked key | revoke then invoke | deny at documented boundary |
| Expired key | clock beyond expiry | deny |
| Quota exhausted | quota already consumed | deny without provider call |
| Rate exhausted | window counter at limit | deny without provider call |
| Invalid schema | unknown field / malformed request | reject before provider |
| Prompt cap | prompt over limit | reject before provider |
| Output cap | provider output too large | reject and record safe failure |
| Provider timeout | stub delays past configured limit | stable timeout response; cleanup |
| Provider error | stub throws | generic external error; internal diagnostic redacted |
| Cancellation | abort request | provider cancellation/cleanup documented |
| Audit redaction | prompt/key/hash/output in input | audit contains no sensitive payload |
| Idempotency | repeat same token/request | behavior matches policy; no unintended duplicate |
| Concurrent quota | parallel calls at boundary | limit cannot be exceeded (requires atomic store) |
| Key rotation | old/new key behavior | documented overlap and revocation semantics |
| Health/config | provider absent/misconfigured | no false readiness; safe failure |

## Suggested sequence
1. Implement a mock gateway facade that composes verifier, key manager and provider adapter without HTTP.
2. Write table-driven negative tests first: identity, tenant, scope, revocation, schema, quota and rate.
3. Add happy path with provider stub and assert request/response schema plus execution disabled.
4. Add timeout, cancellation, failure and redaction tests.
5. Mark concurrency, idempotency and persistence tests as blocked until atomic durable storage and policy exist.
6. Only then add HTTP routing, with request size limits and explicit middleware order.

## Release gate
No integration is considered ready until all unblocked tests pass, negative tests prove provider is not called on denial, and review confirms no client-controlled identity, unsafe tool execution or secret/prompt logging. This plan is not evidence that tests have run.
