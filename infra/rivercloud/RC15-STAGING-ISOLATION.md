# RC-15 — staging isolation and worker boundary prototype

## Prototype
- Plans are bound to project, 40-character commit SHA, fixed worker profile, staging path and explicit approval flag.
- Fixed profiles only: node-static (read-only, network disabled) and node-tests (network disabled, bounded timeout metadata).
- Plan validator rejects altered plans that enable execution.
- Isolation checklist covers host separation, non-root worker, resource limits, network denial, no Docker socket, credential separation and cleanup.
- No worker process is started by this module.

## Target architecture before execution
Use a separate host/VM or hardened container runtime with namespace isolation and seccomp/AppArmor, resource quotas, no privileged mode, no host mounts except reviewed staging paths, network egress deny-by-default, dedicated identities, ephemeral workspace and teardown. Treat project content and build scripts as untrusted. Require review of runtime, image provenance and supply-chain controls.

## Limits
Prototype and tests are authored, not runtime-verified. Metadata limits are not enforced by an actual runtime. No staging server, VM, container or worker has been created or started. No deployment or production access.
