# RiverCloud Infrastructure

This directory is the infrastructure-as-code workspace for the self-hosted RiverSpend platform.

## Master architecture
See [River DataCenter RSS — Master Blueprint and Ecosystem Inventory](../docs/RIVER-DATACENTER-RSS-MASTER-PLAN.md) for the full application catalogue, platform services, target topology, zero-cost rollout and acceptance rules.

## Services
- **River DataCenter RSS** — ecosystem architecture, inventory and coordination.
- **RiverCloud** — cloud/network/storage/ingress foundation.
- **RiverGit** — Forgejo source hosting and repository mirror.
- **RiverDeploy** — Coolify-based build, preview and deployment control.
- **RiverDatabase** — official Supabase self-hosted distribution, subject to compatibility review.
- **RiverBackup** — encrypted backups and restore drills.
- **RiverMonitor** — health, logs, metrics and alerting.
- **Fortress 10.0** — registry, policy, release evidence and operational view.
- **River ID / RiverAuth, River API Gateway, River Security, RiverRecovery, River Payments and RiverSSAI 10.0** — shared platform capabilities defined in the master blueprint.

## Cost and deployment rule
Current approved budget is **€0**. Do not provision paid infrastructure, start paid trials, buy domains or activate billable services. Work locally and use genuinely free resources only. No production deployment, merge, live database change or data migration is authorized.

Nothing here is production-ready merely because it exists in Git. Pin and review images, isolate hosts and runners, configure secrets outside Git, enable firewall/TLS, and pass the acceptance gates before exposing services.

Start with the RiverGit local pilot. Do not connect production repositories or migrate data until backup and restore have been rehearsed.
