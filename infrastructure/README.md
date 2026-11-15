# RiverCloud Infrastructure

This directory is the infrastructure-as-code workspace for the self-hosted RiverSpend platform.

## Services
- **RiverGit** — Forgejo source hosting and repository mirror.
- **RiverDeploy** — Coolify-based build, preview and deployment control.
- **RiverDatabase** — self-hosted Supabase stack deployed from the official distribution after version and security review.
- **RiverBackup** — encrypted, off-host backups and restore drills.
- **RiverMonitor** — health, logs, metrics and alerting.
- **RiverCloud** — network, storage, ingress and service foundation.
- **Fortress 10.0** — central registry, policy and operational view.

## Deployment rule
Nothing here is production-ready merely because it exists in Git. Pin tested image digests, provision isolated hosts, configure secrets outside Git, enable firewall/TLS, and pass the acceptance gates in [the architecture plan](../docs/RIVERCLOUD-OWN-INFRASTRUCTURE.md) before exposing services.

Start with `rivergit/` on a disposable isolated host. Do not connect production repositories or migrate data until backup and restore have been rehearsed.
