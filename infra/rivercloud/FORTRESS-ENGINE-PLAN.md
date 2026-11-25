# RiverCloud RC-4/RC-3 implementation plan — Fortress

## Scope of this increment
Panel UI scaffold and deploy-engine contract only. This is NOT a live deployment engine, server control plane, or security certification.

## Control-plane API contract (future)
- POST /api/deploy: authenticated operator request, project ID + immutable commit SHA + staging target; never accept arbitrary shell commands or raw compose files.
- POST /api/webhooks/github: verify HMAC SHA-256, event type, timestamp window and delivery ID replay protection; accept only configured repository IDs and branch policies.
- GET /api/deployments: role-scoped audit/deployment history.
- GET /api/projects/:id/status: sanitized health/status.
- POST /api/deployments/:id/rollback: role-scoped, auditable rollback to a verified known-good release.

## Required gates
1. MFA-capable authentication; secure session cookies; CSRF protection; rate limiting.
2. RBAC roles (viewer, operator, administrator); least privilege.
3. Project/repository/branch allowlist; require immutable commit SHA.
4. Webhook HMAC signature, delivery replay protection and payload validation.
5. Build in ephemeral, isolated workers. No Docker socket exposed to web/control agent.
6. Resource quotas and network restrictions for build/runtime containers.
7. Secrets encrypted at rest, never in logs, repository, build output or panel HTML.
8. Artifact provenance and image digest pinning; vulnerability scanning policy.
9. Health checks and automated rollback to last-known-good; manual production approval.
10. Append-only audit records, backup and restore testing.

## RC-4 panel
A static UI scaffold is in panel.html. It deliberately has no credential handling or destructive controls wired up. It shows the intended modules and safe-mode status.

## RC-5/RC-6
Monitoring, alerting, backups, restore drills, staging, migration and cutover readiness follow only after the server and secure runner exist.
