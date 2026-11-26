# Mock integration slice: RiverSSAI ↔ River API

This slice is an isolated, dependency-injected facade and native Node tests. It is **not** an HTTP server, production gateway, real identity verifier, durable key store, or production deployment.

Run tests using Node's built-in runner:
```sh
node --test river-integration/test/facade.test.js
```

## Security boundaries
- Identity is supplied only by injected verifier output; request body fields cannot override it.
- API-key authorization is delegated to an injected key manager for the verified tenant and inference scope.
- Provider calls are bounded by request/output size and token-count input; provider timeout is bounded and passes an AbortSignal; adapter must honor cancellation.
- Audit callback receives a minimal allowlisted record only.
- This prototype intentionally has no shell, tools, URL-fetch capability, network routing, or live credentials.

## Prototype controls
- Bounded in-memory idempotency primitive: tenant-scoped request IDs, payload conflict detection, shared concurrent result, TTL and entry cap. Not durable or cross-instance.
- Bounded in-memory fixed-window quota prototype: per-tenant counters, configurable window/request limit, tenant-bucket cap, and reset behavior. The facade can accept an injected quota store and deny requests over quota (429); quota is optional and disabled if no store is injected.
- These in-memory stores are test/prototype components. Restarting the process clears their state and multiple instances do not coordinate.

## Requirements before production
1. Durable, shared, atomic quota enforcement (e.g. database transaction or atomic Redis operation); prevent race-condition oversubscription.
2. Durable idempotency keyed by tenant and request ID, with payload digest conflict detection and atomic result reservation/completion.
3. API-key storage using hashed secrets, rotation, revocation and tenant/scope checks.
4. Authenticated identity integration, authorization policy, abuse controls and request validation at HTTP boundary.
5. Audit delivery with integrity protections, retention policy, access control and alerting; ensure no sensitive prompts or secrets are logged.
6. Explicit timeout, cancellation and retry policy; retries must not duplicate provider work or side effects.
7. Secrets management, TLS, rate limits, isolation, dependency scanning, threat model, monitoring and incident procedures.
8. Load, concurrency, fault-injection, backup/restore and security tests in isolated staging before any production release.

## Status
This is a mockable integration slice for test and design iteration. It is not production-ready and does not provision or connect live services.
