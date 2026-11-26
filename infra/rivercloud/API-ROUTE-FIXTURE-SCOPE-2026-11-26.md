# API Route Behavioral Fixture Scope — 2026-11-26

## Added isolated HTTP fixtures
File: `tests/rivercloud/api-route.behavior.test.mjs`

Coverage authored:
- Engine API: missing bearer authorization rejected; authenticated health reports runner/execution disabled.
- Engine API: accepted plan returns plan-only state; repeat request is idempotent; queue list reflects one entry.
- Proxy API: unmapped groups are denied; viewer health read succeeds; viewer plan submission denied.
- Proxy API: operator plan submission creates a queue-only job and pseudonymous actor reference.

## Boundaries
- The tests are authored but not executed.
- HTTP fixtures bind only to loopback and use temporary state.
- They do not prove that production ingress strips forged forwarded headers or that a real identity provider authenticates the headers.
- No runner, shell, build, deployment, external staging or real credentials are used.
- Review fixture assumptions and API startup/cleanup behavior before execution.
