# RC-5 — Runner boundary prototype

This milestone introduces a deliberate boundary between accepted deployment plans and execution.

## Included
- `runner.mjs` validates the request using the policy engine and emits a prepared run record with a digest-based identity.
- `runner.test.mjs` covers prepared status, blocked execution, and rejection of invalid plans.
- Execution is explicitly disabled. This prototype does not run shell commands, build applications, fetch source, use Docker, or deploy.

## Required before an executable worker
1. A separate worker host or isolated ephemeral VM/container with a restrictive profile.
2. No public Docker socket, no privileged container, no host filesystem mounts beyond a dedicated workspace.
3. Fixed build command profiles per allowlisted repository; no user-supplied shell strings.
4. Network egress allowlist and resource/time limits.
5. Signed webhook verification, replay protection and durable audit trail.
6. Approval gate and verified health-check/rollback strategy before any production release.
7. Test fixtures, threat-model review and deployment rehearsal.

## Test
`node --test infra/rivercloud/runner.test.mjs infra/rivercloud/engine.test.mjs`

Tests have not been executed in the remote branch environment. No worker is connected.
