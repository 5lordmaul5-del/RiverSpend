# API-RC-136 — RiverSSAI planning-only mock orchestrator

Date: 26 November 2026

## Scope
- Validates the registry on construction and indexes active definition IDs.
- Verifies the caller's test-prefixed API key for `ai:invoke`.
- Validates agent/version, status, bounded request and input-schema shape.
- Canonicalizes the input and computes a domain-separated digest.
- Enforces idempotency with same-input replay and conflicting-input rejection.
- Fails closed on high-risk definitions until a binding-aware approval callback returns explicit true; verifier exceptions are denied.
- Returns a planning envelope only; `executionEnabled=false`. No process, worker, shell, model, network call or handler is launched.

## Limits
This is a mock planning orchestrator, not an operational RiverSSAI runtime. Definition `maxRunSeconds` and `maxConcurrency` are recorded in the plan but not enforced by a runner. The approval callback is a test boundary, not a real approval service. The in-memory idempotency map is not durable and does not replace the gateway store.

## Reproducible tests
```sh
node --test infra/rivercloud/river-ssai-orchestrator.test.mjs
```

No production key, agent process, live service or payment operation is used.
