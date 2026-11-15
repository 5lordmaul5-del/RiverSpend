# RiverCloud Own Infrastructure — Cloud-First Build Plan

**Status:** architecture and deployment scaffolds committed  
**Branch:** `feat/river-fortress-integration-core`  
**Operating assumption:** the owner has a laptop only; no server or cloud host has been provisioned. The laptop is the administration/development workstation, not a production server.  
**Production state:** unchanged; no deployment, purchase, or data migration performed.

## 1. Objective

Build a RiverSpend-controlled platform that can host source control, application delivery, data services, backups and operations without relying permanently on Vercel, GitHub or Supabase Managed.

This reduces platform lock-in but does not eliminate all external dependencies: cloud compute providers, network transit, DNS/registrars, certificate authorities, software maintainers and operators remain dependencies. Resilience requires portability, independent backups, tested restores and more than one failure domain.

## 2. Cloud-first operating model

- **Laptop:** local editor, Git client, SSH client, MFA authenticator and emergency recovery documentation. No production services depend on the laptop being powered on.
- **Cloud pilot:** first provision one small isolated cloud VM for RiverGit only, after provider, region and budget approval.
- **Separate deployment plane:** provision RiverDeploy/Coolify on a separate VM after RiverGit has passed security, persistence and restore checks.
- **Separate data plane:** provision RiverDatabase on a separately sized host/VM after feature compatibility and capacity review.
- **Independent backup destination:** a separate provider/account, preferably another region, with encryption keys and credentials independent from production.
- **Fortress 10.0:** tracks service registry, release evidence, health and recovery status; it must not become a single point of failure for application traffic.

## 3. Target service architecture

| RiverSpend service | Initial technology | Responsibility |
|---|---|---|
| RiverGit | Forgejo + PostgreSQL | Git hosting, issues and repository mirror |
| RiverDeploy | Coolify | Build, preview, deploy, domains and TLS orchestration |
| RiverDatabase | Official Supabase self-hosted distribution | PostgreSQL, Auth, REST, Storage and supported services |
| RiverBackup | Restic or equivalent + PostgreSQL-native backups | Encrypted off-host copies and restore tests |
| RiverMonitor | Prometheus/Grafana + alerting, sized later | Metrics, dashboards and alerts |
| RiverCloud | Cloud VMs, Linux, Docker, private networks, reverse proxy, object storage | Compute, networking, ingress and persistent storage |
| Fortress 10.0 | RiverSpend control plane | Registry, policy, health, release evidence and operator view |

### Important boundaries

- Coolify is the deployment control plane, not a source-control replacement; Forgejo owns Git repositories.
- Forgejo Actions runners are separate execution infrastructure. They must not run privileged workloads on the RiverGit host.
- Supabase self-hosting is not feature-identical to Supabase Managed. Managed branching, managed backups/PITR, hosted analytics, management APIs and other hosted capabilities may be absent or require separate tooling. Validate every required feature before migrating an app.
- Keep service databases isolated. Do not create one shared database or give every app unrestricted SQL access.
- Never put secrets, signing keys, production connection strings or customer data in Git.

## 4. Phased rollout

### Phase 0 — laptop preparation (no server required)
Prepare Git/SSH tooling, password manager, MFA and a local encrypted copy of infrastructure documentation. Generate SSH keys locally and protect the private key with a passphrase. Never send private keys, passwords or recovery codes in chat or commit them to Git.

### Phase 1 — RiverGit cloud pilot
Provision one isolated VM in a selected cloud provider/region. Install Forgejo and PostgreSQL using the scaffold in `infrastructure/rivergit/`. Keep access restricted behind a VPN or trusted ingress, disable public registration, enable MFA, and configure encrypted off-host backups. Initially mirror a non-critical repository and verify history, clone/push, persistence, backup and clean-host restore. Do not make it the only copy of RiverSpend.

### Phase 2 — RiverDeploy
Only after Phase 1 passes, provision a separate VM for Coolify. Connect RiverGit with a repository-scoped deploy credential and deploy a disposable sample app to Preview. Test TLS, health checks, logs, redeploy, rollback and host reboot. Keep build workers isolated from database and backup networks.

### Phase 3 — RiverDatabase
Provision a separately sized VM for the official Supabase self-hosting distribution, pinned to a reviewed release. Validate Auth providers, SMTP, OAuth callbacks, JWT settings, PostgreSQL extensions, RLS, Data API grants, Storage policies, Realtime, Edge Functions, upgrades and restore. Identify replacements for missing managed features before migrating any app.

### Phase 4 — independent recovery and monitoring
Send encrypted backups to a separate provider/account and preferably a different region. Keep backup credentials separate from production credentials. Test restore onto a clean independent host and record actual RPO/RTO. Add monitoring and alerting for host health, disk, certificates, backup freshness, service availability and failed jobs.

### Phase 5 — dual operation and gradual migration
Keep GitHub, Vercel and Supabase Managed active while each app moves independently. Reconcile repository history, data, auth identities, files and API behavior. Cut over one app at a time with DNS/client configuration and rollback plans. Retire a managed dependency only after successful observation and a tested rollback window.

## 5. RiverGit pilot scaffold

The first implementation is under `infrastructure/rivergit/`:
- `compose.yml` — Forgejo and PostgreSQL, persistent named volumes, database health check, loopback-only host bindings, internal application network and no-new-privileges.
- `.env.example` — names only; copy to a host-local `.env`, replace placeholders and never commit the populated file.
- `README.md` — host preparation and release boundaries.

The image variables deliberately require explicit immutable references. Do not start the stack until exact image tags/digests, configuration compatibility, UID/GID, proxy headers and upgrade path have been checked against official release documentation. A Compose file in Git is not evidence that the service is installed or tested.

The initial Compose network is internal. If outbound mail, OAuth, updates or webhook delivery are required, add a narrowly controlled egress path after reviewing the threat model; do not expose the database or bind the application to all interfaces.

## 6. Security baseline

- Separate hosts or trust zones for source hosting, CI runners, deployment control, database and backup.
- Firewall default-deny; expose only required HTTPS ingress and explicitly required SSH/VPN endpoints.
- MFA for all administrators; disable public registration; least-privilege service accounts.
- Immutable image digests, pinned OS packages, dependency scanning and a documented patch window.
- Secrets in a secret manager or protected host environment, never in Git or browser bundles.
- Encrypted disks where supported; encrypted off-host backups; documented key custody and recovery.
- PostgreSQL private networking, least-privilege roles, RLS tests for exposed user data.
- Audit administrative actions and preserve logs off-host.
- No privileged runner on the RiverGit or database host; isolated workers for untrusted jobs.
- Test upgrades and rollback on staging before production.

## 7. Acceptance gates

A service is not marked operational until evidence exists:
1. Provisioning: host inventory, OS patch level, firewall, DNS, TLS and resource monitoring.
2. Install: pinned image digest, reproducible deployment and clean startup.
3. Access: MFA, disabled open registration, admin recovery procedure and least privilege.
4. Network: only required ports reachable; database inaccessible from public internet.
5. Persistence: restart and host-reboot tests preserve expected data.
6. Backup: encrypted off-host backup completes and integrity is checked.
7. Restore: restore onto a clean independent host succeeds; measured RPO/RTO recorded.
8. Security: no unresolved critical/high findings from configuration and vulnerability review.
9. Operations: monitoring, alerts, log retention, patching and incident runbooks.
10. Migration: per-app data/auth/API compatibility, reconciliation and rollback tests pass.

## 8. Current status

| Component | Status |
|---|---|
| Cloud-first architecture | Documented |
| Laptop workstation | Assumed; setup instructions pending |
| RiverGit Compose scaffold | Committed; not executed |
| Cloud provider / region / budget | Not selected |
| RiverGit cloud VM | Not provisioned |
| RiverDeploy / Coolify | Candidate selected; not installed |
| RiverDatabase / Supabase self-hosted | Candidate selected; compatibility review and install not started |
| RiverBackup | Policy specified; no destination or restore test |
| RiverMonitor | Not installed |
| Fortress operational console | Design only; not a live control plane |
| Production migration | Not authorized or started |

## 9. Decisions required before provisioning

No cloud account, VM or paid service should be purchased automatically. Before provisioning, confirm:
- provider and region (prefer a suitable EU region if data residency and latency require it);
- maximum monthly budget and storage allowance;
- whether a domain/subdomain is available for RiverGit and RiverDeploy;
- recovery targets: tolerable data loss and downtime;
- who holds administrator MFA and backup recovery keys.

Do not place RiverGit, Coolify, production Supabase, CI runners and backups on one small VM and call it resilient. A single low-cost pilot VM can validate RiverGit, but it is not the final production topology.

## 10. Coexistence and rollback

GitHub, Vercel and Supabase Managed remain authoritative until explicit migration approval. Mirror repositories first and verify history/LFS/artifacts if used. Deploy Preview applications from RiverDeploy before DNS cutover. Export and reconcile data before switching database clients. Keep a tested rollback path to current providers throughout the migration window.

**No merge, production deployment, live Supabase modification, secret change, customer-data transfer, cloud purchase or paid server provisioning is included in this implementation.**
