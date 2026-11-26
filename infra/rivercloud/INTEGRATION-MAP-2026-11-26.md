# RiverCloud integration map — 2026-11-26

Branch: `feat/rivercloud-unified-policy-2026-11-26`
Source inspection only. No tests or runtime execution.

## Confirmed call paths

`server.mjs` -> `queue.mjs` -> `engine.mjs` -> `unified-policy.mjs`
- API server authenticates a bearer token, then exposes queue health/list/plan endpoints.
- Queue validates deployment input and stores a digest-backed, idempotent plan.
- Engine validates exact input shape, project/branch/target policy and immutable commit SHA.
- Shared policy currently allows only RiverSpend/main/staging and two worker profiles.

`rc34-proxy-api.mjs` -> `queue.mjs` -> `engine.mjs` and `rc11-state.mjs`
- Proxy API checks peer address and maps forwarded identity/group headers to roles.
- The header identity is not equivalent to verified identity unless the proxy deployment and trust boundary are validated.
- Queue API and proxy API are separate entry points.

`approval-bound.mjs` -> `rc17-atomic-lifecycle.mjs` -> `rc11-state.mjs`
- Approval tokens are HMAC-bound, nonce-bearing and intended for one-time consumption.
- The approver label is not authenticated at this layer.
- Lifecycle/audit transaction path is described in README as an isolated migration API, not wired to existing callers.

`runner.mjs` -> `engine.mjs`
- Creates and verifies a prepared envelope only.
- Execution function explicitly throws: execution disabled.

`docker-compose.yml`
- Caddy -> oauth2-proxy -> API/demo upstream scaffold.
- API is on internal network, with read-only filesystem, tmpfs, dropped capabilities and resource limits.
- Configuration is scaffold-only; no credentials/services or deployment verified.

## Integration findings / blockers

1. **Two queue/API entry points:** document shared contract and confirm route parity, permission behavior and error mapping before connecting.
2. **Identity trust:** provider-issued claims and forwarded headers require end-to-end integration tests; header identity is currently a trust assumption.
3. **Approval/lifecycle isolation:** approval consumption and lifecycle/audit path exist but are not shown wired into queue acceptance or runner envelope preparation.
4. **Execution remains intentionally disabled:** do not connect a live worker until authentication, approval binding, isolated execution, network/resource policy, cleanup, audit and recovery have passed tests.
5. **Storage path configuration:** compose passes `RIVERCLOUD_QUEUE_DIR=/data/state.json`; API treats this value as a store-file path. Verify path naming and directory permissions in a controlled fixture.
6. **Test coverage is not evidence until executed:** RC test files have been authored but not run in this review.

## Closure sequence (no new RC numbering)

- Step 1: establish shared API/policy/actor contract and route-parity tests.
- Step 2: integration-test proxy trust and identity provider verification.
- Step 3: connect lifecycle and approval records to accepted plans without enabling execution.
- Step 4: validate persistence, crash recovery, backup/restore with disposable fixtures.
- Step 5: test CI path coverage on this branch and fix any gaps.
- Step 6: only then conduct an isolated staging rehearsal; execution remains opt-in and requires explicit approval.

## Status
This map is an engineering inventory, not a security certification, live verification, or claim of operational readiness.
