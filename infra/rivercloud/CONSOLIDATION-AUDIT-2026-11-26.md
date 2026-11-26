# RiverCloud + RiverSSAI consolidation audit — 2026-11-26

## Repository inspection (source-only)
Branch: `feat/rivercloud-unified-policy-2026-11-26`.
No test execution, container build, deployment, merge, or external-service verification was performed during this audit.

## RiverCloud verified source observations
- `server.mjs`: loopback bearer-token API; queue-only `/deploy`; execution is explicitly disabled.
- `rc34-proxy-api.mjs`: trusted-proxy address check, group-to-role mapping, pseudonymous actor attribution, and limited health/jobs/plan routes.
- `rc13-identity.mjs`: claims validation and role policy. Its own comments state provider verification is not integrated.
- `unified-policy.mjs`: allowlist currently supports only RiverSpend, `main`, and staging, plus two worker profiles.
- `engine.mjs` and `runner.mjs`: declarative plans/envelopes; no execution.
- `rc11-state.mjs`: hardened bounded single-file transactional state prototype.
- `approval-bound.mjs`: prototype approval binding, while approver identity is expressly not verified.
- `docker-compose.yml`: OIDC proxy/API/demo scaffold, with isolated internal network and hardened API container configuration.
- `README.md`: documents several components as prototypes and integration gaps.

## Priority integration gaps (not a security certification)
1. **Authentication/attribution integration:** the proxy header identity path is gated by the fixed proxy address, but the end-to-end provider verification, group claim configuration, and operational deployment are not proven. Validate compose/proxy/API trust boundaries and headers in integration tests.
2. **Policy drift:** route policy, unified deployment policy, worker-profile validation, and approval binding are separate layers. Consolidate shared schemas/constants and create a cross-layer contract test.
3. **Lifecycle wiring:** approval/lifecycle APIs and the current queue/server route appear to be separate paths. Map call graph and wire only after a clear contract and test.
4. **Execution boundary:** keep execution disabled until authenticated approval, isolated workspace, resource limits, network controls, audit integration, cleanup, and recovery are implemented and tested.
5. **State consistency:** state prototype has strict bounded storage and transactional behavior; verify cross-file lifecycle/state consistency, crash recovery, and backup/restore using non-production fixtures.
6. **CI workflow coverage:** workflow is path-filtered and includes Node, shell, Python, compose validation, build, SBOM, scan and Caddy validation. Its push branch selector currently names a specific older core branch, so coverage on this consolidation branch may depend on PR/manual triggering. Review triggers and path coverage.

## RiverSSAI source observation
- `pages/api/river-ai/chat.js` is a Next API handler using Supabase client import, bounded message/history/parallel agent limits, and a specialist registry.
- `docs/RIVERSSAI_ULTRA_20_SPEC.md` explicitly describes the 20.0 work as a staged build specification, not implemented capability.
- This source review does not establish standalone/offline independence; that is a separate implementation and validation target.

## Suggested sequence
A. Map route-to-module call graph and policy/identity contracts.
B. Add contract tests for shared policy and trusted identity assumptions.
C. Integrate lifecycle/approval with the queue through explicit typed contracts, keeping execution disabled.
D. Review and adjust CI triggers/coverage.
E. Separate RiverSSAI provider dependencies from its orchestration core; begin with interface contracts and dependency inventory.
F. Only after test runs and operator review, plan a staging rehearsal.

