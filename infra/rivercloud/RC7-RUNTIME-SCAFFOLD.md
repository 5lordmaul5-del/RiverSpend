# RC-7 — Runtime adapter scaffold

This milestone introduces a reviewable execution envelope, not a working build executor.

## Behavior
- Validate job against fixed profiles and staging-only policy.
- Create a digest-backed envelope recording isolation requirements.
- Explicitly require approval.
- Execution entry point throws while runtime isolation, approval and audit integration remain incomplete.

## Isolation requirements
- Ephemeral workspace; non-root worker.
- No host filesystem mounts or Docker socket.
- Resource and duration limits.
- Restricted network egress.
- Fixed commands mapped by profile, never arbitrary caller-provided commands.
- Job logs and artifacts scrubbed for secrets.
- Cleanup and failure handling.
- Human approval before any deployment action.

## Tests
`node --test infra/rivercloud/rc7-worker.test.mjs infra/rivercloud/worker-spec.test.mjs`

The runtime-scaffold tests are included in verified CI #275/#276 and #277/#278 (124/124). No build or deployment is executed.
