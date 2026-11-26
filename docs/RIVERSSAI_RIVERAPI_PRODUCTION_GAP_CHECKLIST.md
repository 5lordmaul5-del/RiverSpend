# RiverSSAI ↔ River API production-readiness gap checklist

This is a planning checklist, not a claim of production readiness.

## Replace mock boundaries
- [ ] HTTP transport with strict request parsing, TLS at deployment boundary and server-side request timeout.
- [ ] Real identity verifier: signed token validation, issuer/audience/expiry, tenant and actor binding.
- [ ] API key lookup backed by durable storage; store only keyed hashes; rotation and revocation.
- [ ] Atomic quota reservation and rate limiting across workers, with rollback on failed reservation.
- [ ] Provider adapter allowlist and network egress policy; no arbitrary URL/provider selection from requests.
- [ ] Cancellation propagation and hard timeout; bounded response size.
- [ ] Durable, append-only audit delivery with redaction and retention controls.
- [ ] Idempotency key persistence and replay semantics.
- [ ] Observability: structured metrics, trace correlation, health/readiness without secret leakage.
- [ ] Security test suite: tenant isolation, authorization, race conditions, abuse limits, redaction, resilience.
- [ ] Deployment configuration, secret management, backup/restore, SBOM, dependency and image scanning.

## Acceptance gate
Do not enable real execution or deploy to production until each applicable item has implementation, tests, review and documented operator controls.