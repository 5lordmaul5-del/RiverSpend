# RiverCloud Identity and Proxy Trust Gap — Closure Plan (2026-11-26)

## Evidence reviewed
Source-only review of `server.mjs`, `rc34-proxy-api.mjs`, `rc13-identity.mjs`, and `approval-bound.mjs` on branch `feat/rivercloud-unified-policy-2026-11-26`.

## Current prototype facts
- Engine HTTP server requires a bearer token of minimum length and uses a timing-safe equality check; binds only loopback.
- Proxy API validates the connecting peer address against configured trusted proxy address, then accepts identity/group values from forwarded headers. It maps group names to roles.
- Identity claims validator requires issuer/audience/time/role validation and a verification callback, whose default rejects.
- Approval-bound prototype HMAC binds job/project/profile/target/commit/digest; approver label is explicitly not authenticated by the prototype.
- These facts do not prove deployment ingress configuration or real authentication-provider integration.

## High-priority unresolved risks
1. Proxy forwarded identity/group headers may be spoofable if ingress does not strip client-supplied headers and overwrite them.
2. Peer-address trust is a configuration assumption; proxy topology, IPv4/IPv6 normalization and deployment controls are unverified.
3. No authenticated identity provider wiring is demonstrated in the reviewed files.
4. Approval approver labels remain unauthenticated; cryptographic token binding is not identity authentication.
5. No end-to-end authorization/identity chain is demonstrated across ingress, proxy API, queue, lifecycle, audit and runner.

## Required closure evidence (plan only)
- Document trusted ingress topology, address resolution and header stripping/overwrite requirements.
- Add source-only fixtures for forwarded-header spoofing, peer mismatch, group-map ambiguity, malformed headers, empty/unknown groups, role intersection and route authorization.
- Define authenticated actor envelope and provenance; propagate stable actor reference into queue/lifecycle/audit.
- Verify approval issuance/consumption actor identity independently of display label; prohibit self-approval where applicable.
- Reconcile route permission table against role registry and API contract; deny-by-default.
- Add integration tests only after execution is expressly authorized; test against isolated fixtures, not production.
- Keep runner/execution and deployment disabled until these gates have verified evidence.

## Status
Gap closure plan only; no runtime testing, authentication integration, config changes, execution, merge or deployment performed.
