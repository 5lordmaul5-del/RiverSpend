# RiverCloud Engine Prototype (RC-3)
This module is a small, dependency-free policy validator and deployment-plan digest utility.

- Only allowlisted project IDs, repository, branch and target combinations.
- Requires immutable commit SHA.
- Does not execute commands, queue jobs, authenticate callers, invoke webhooks, access Docker or deploy.
- Production is intentionally blocked by policy.
- It is a prototype, not production-ready security software.

Run tests with Node's built-in test runner: `node --test infra/rivercloud/engine.test.mjs`.
