# RiverFortress F4 — ShieldWall perimeter & traffic defense contract

Status: Draft design/contract only. No operational network controls, provider configuration, or production deployment.

## Purpose
Define a defense-in-depth perimeter for RiverCloud/RiverFortress services: reduce exposed routes, validate requests, bound resource consumption, and make failures observable.

## 1. Perimeter principles
- Default-deny for routes, methods, and service-to-service access; explicit allowlists.
- Separate public, authenticated, internal, and administrative route groups.
- Never rely on client-side checks for authorization; F1 Policy/Identity remains authoritative.
- Administrative endpoints are not exposed publicly unless explicitly approved and protected.
- Avoid leaking stack traces, secrets, internal addresses, or infrastructure details in responses.

## 2. Request controls
- Enforce configurable rate limits by route class and identity where available; use conservative anonymous limits.
- Bound request body size, header count/size, upload size, query length, concurrency, and execution time.
- Validate content type, schema, encoding, and input ranges; reject malformed requests.
- Apply pagination and bounded query results to data endpoints.
- Use idempotency keys for eligible state-changing operations; detect duplicate/replay requests.
- Keep limits configurable, versioned, and tested; do not invent a single universal limit.

## 3. Abuse and resilience
- Mitigate bursts through upstream/provider protections where available; this contract alone does not provide DDoS capacity.
- Backpressure queues and worker pools; reject excess work predictably.
- Circuit breakers and bounded retries; avoid retry storms.
- Isolate workloads and degrade noncritical services before core services where policy permits.
- Fail closed for privileged operations and integrity/authentication failures. Fail safely for public read paths only where explicitly defined.

## 4. Network and route exposure
- Document service inventory, trust zones, ports, and ingress/egress needs.
- Restrict egress to documented destinations; block unexpected egress by default where feasible.
- No direct database or vault exposure to public ingress.
- Use TLS in transit; define certificate validation and rotation expectations.
- Separate management plane from data plane; management access requires approved identity and auditable access.

## 5. Privacy-preserving telemetry
- Record route class, decision, limit bucket, coarse timing, request correlation ID, and relevant non-sensitive metadata.
- Do not log passwords, tokens, secret values, payment data, full payloads, or unnecessary personal data.
- Retain security logs according to approved retention policy and access controls.
- Alert on threshold exhaustion, repeated invalid requests, route discovery anomalies, egress policy violations, and perimeter control failures.

## 6. Integration contracts
- F1 Policy/Identity: authorization and approval remain separate from perimeter filtering.
- F2 RiverVault: secrets are never returned in telemetry or error messages.
- F3 Sentinel: alerts are emitted as sanitized events; failure of alert delivery is itself detectable.
- RiverCloud: bounded execution, queue capacity, and service-health contracts are prerequisites before enabling workloads.

## 7. Test acceptance matrix
- Unapproved routes/methods denied.
- Request-size and time bounds reject oversized/slow requests.
- Rate-limit behavior is deterministic and does not bypass identity scope.
- Malformed payloads, invalid encodings, and schema failures are rejected.
- Retry and circuit-breaker behavior cannot create retry storms.
- Privileged route checks cannot be bypassed by perimeter-only allowlisting.
- Egress allowlist violations are blocked or surfaced in the test environment.
- Telemetry sanitization tests confirm no secrets or sensitive payloads.
- Alert delivery failure and resource exhaustion are detectable.
- Recovery/degraded-mode behavior is documented and tested.

## 8. Readiness gate F4
Before implementation or production use: threat model review; route/service inventory; configuration review; tests in isolated staging; provider-level DDoS/perimeter capabilities documented; privacy/retention review; independent security review; rollback plan; explicit owner authorization.

## Out of scope / not claimed
This document is not a firewall, WAF, DDoS mitigation service, network policy, or live rate limiter. It does not configure hosting providers, deploy code, or authorize production use.
