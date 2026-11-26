# RiverCloud Policy and Actor Contract

Source review, 2026-11-26. No tests or runtime execution performed.

## Contract observations
- Deployment request contract is a strict four-key allowlist: projectId, branch, commit, target.
- Policy currently permits only project `riverspend`, repository `5lordmaul5-del/RiverSpend`, branch `main`, target `staging`.
- Commit is validated as a 40-character immutable SHA by the engine.
- Worker profile declarations are restricted to `node-static` and `node-tests`; the policy resolver is declarative.
- Actor-context normalization accepts a pseudonymous SHA-256 actorRef and a bounded role list; this normalization does not authenticate that actor.
- The contract's role catalog is descriptive; enforcement is in the route layer and should be consistent with the identity provider and policy.

## Remaining risks / gates
1. Do not treat actorRef or roles in an API payload as proof of identity. They must be populated by trusted authentication middleware.
2. Keep project, branch, target and worker profile allowlists restrictive; changes require review and tests.
3. Ensure the strict request contract rejects unknown keys and accessor/symbol properties, including across all ingress routes.
4. Avoid silently widening role permissions or allowing role combinations that bypass intended separation of duties.
5. Add behavioral tests for policy denial cases, malformed request shapes, normalization, and both API ingress paths.
6. Execution/deployment remains disabled. This review does not authorize any real build or deployment.

