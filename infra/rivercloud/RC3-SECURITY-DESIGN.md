# RC-3 deployment pipeline — security requirements

This document defines requirements; it is not an implementation or security certification.

- Keep the deployment control plane private or behind strong authentication and TLS.
- Only explicitly allow-listed repository IDs and branches.
- Verify GitHub webhook HMAC signatures and timestamp/replay protections.
- Queue jobs; never run arbitrary commands supplied by webhook/request data.
- Build and run applications in isolated containers with resource limits.
- Never mount the host Docker socket into an internet-facing agent.
- Secrets stored outside Git, encrypted at rest, least privilege, rotation.
- Audit every deployment actor, commit, result, and rollback.
- Verify health checks before promoting; retain known-good rollback versions.
- Rate limit, reject malformed payloads and monitor failures.
- Back up config and data separately; periodically test restores.
- Require manual approval for production promotion.
