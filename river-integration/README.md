# Mock integration slice: RiverSSAI ↔ River API

This slice is an isolated, dependency-injected facade and native Node tests. It is **not** an HTTP server, production gateway, real identity verifier, or durable key store.

Run tests using Node's built-in runner:
```sh
node --test river-integration/test/facade.test.js
```

Security boundaries:
- identity is supplied only by injected verifier output; request body fields cannot override it.
- API-key authorization is delegated to an injected key manager for the verified tenant and inference scope.
- provider calls are bounded by request/output size and token-count input; provider timeout is bounded and passes an AbortSignal; adapter must honor cancellation.
- audit callback receives a minimal allowlisted record only.
- this prototype intentionally has no shell, tools, URL-fetch capability, network routing, or live credentials.

A bounded in-memory idempotency primitive is included for prototype/testing: tenant-scoped request IDs, payload conflict detection, shared concurrent result, TTL and entry cap. It is NOT durable or cross-instance.\n\nNot yet addressed: HTTP middleware/order, durable key store and atomic quota/rate enforcement, external identity provider, durable audit, transactional/durable idempotency, distributed concurrency, staging.
