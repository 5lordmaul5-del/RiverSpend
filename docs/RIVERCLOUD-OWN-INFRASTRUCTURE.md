# RiverCloud Own Infrastructure — Architecture and Build Plan

**Status:** architecture + first isolated deployment scaffold  
**Branch:** `feat/river-fortress-integration-core`  
**Production state:** unchanged; no host provisioned, no deployment performed, no production data migrated.

## 1. Objective

Build a RiverSpend-controlled platform that can host source control, application delivery, data services, backups and operations without requiring Vercel, GitHub or Supabase Managed as the permanent control points.

This reduces platform lock-in; it does not eliminate every external dependency. RiverSpend will still depend on physical/virtual server providers, power, network transit, DNS/registrars, certificate authorities, software maintainers and operators. Resilience comes from portability, independent backups, tested restores and a second failure domain — not from a claim of total independence.

## 2. Target architecture

| RiverSpend service | Initial technology | Responsibility |
|---|---|---|
| RiverGit | Forgejo + PostgreSQL | Git hosting, issues and repository mirror |
| RiverDeploy | Coolify | Build, preview, deploy, domains and TLS orchestration |
| RiverDatabase | Official Supabase self-hosted distribution | PostgreSQL, Auth, REST, Storage and supported Supabase services |
| RiverBackup | Restic or equivalent + PostgreSQL-native backups | Encrypted off-host copies and restore tests |
| RiverMonitor | Prometheus/Grafana + alerting, selected after sizing | Metrics, dashboards and alerts |
| RiverCloud | Linux, Docker, private networks, reverse proxy, object storage | Compute, networking, ingress and persistent storage |
| Fortress 10.0 | RiverSpend application/control plane | Registry, policy, health, release evidence and operator view |

### Important boundaries

- Coolify is the deployment control plane, not a source-control replacement; Forgejo owns Git repositories.
- Forgejo Actions runners are separate execution infrastructure. They must not run privileged workloads on the RiverGit host.
- Supabase self-hosting is not feature-identical to Supabase Managed. Managed branching, managed backups/PITR, hosted analytics, management APIs and other hosted capabilities may be absent or require separate tooling. Validate every required feature before migrating an app.
- Keep service databases isolated. Do not create one shared database or give every app unrestricted SQL access.
- Fortress consumes versioned service APIs and operational signals; it must not become a single point of failure for application traffic.
- Never put secrets, signing keys, production connection strings or customer data in Git.

## 3. Failure-domain design

### Phase A — safe pilot
One isolated VM for RiverGit only, private web/SSH bindings, separate PostgreSQL volume, no production repositories and no Actions runner. Use a separate backup destination.

### Phase B — deployment plane
A separate VM for RiverDeploy/Coolify. Connect only the pilot RiverGit repository. Build one non-production sample application. Keep build workers isolated from control-plane services.

### Phase C — data plane
A separate host or isolated VM for RiverDatabase. Deploy from the official Supabase self-hosting files at a reviewed, pinned release. Validate Auth, RLS, Storage, API, email flows, extensions, upgrades and restore before considering any app migration.

### Phase D — independent recovery
Store encrypted backups in a different provider/account and preferably a different region. Keep backup credentials separate from production credentials. Test restore onto a clean host and record actual RPO/RTO. Replication is not a backup; a standby is not a tested failover.

### Phase E — dual operation and migration
Keep existing managed services running while each app is moved independently. Use export/import, data reconciliation, authentication transition, DNS cutover and rollback plans per app. Retire a managed dependency only after successful production observation and a tested rollback window.

## 4. RiverGit pilot scaffold

The first implementation is under `infrastructure/rivergit/`:
- `compose.yml` — Forgejo and PostgreSQL, persistent named volumes, database health check, loopback-only host bindings, internal application network and no-new-privileges.
- `.env.example` — names only; copy to a host-local `.env`, replace placeholders and never commit the populated file.
- `README.md` — host preparation and release boundaries.

The image variables deliberately require explicit immutable references. Do not start the stack until the exact image tags/digests, Forgejo configuration compatibility, UID/GID, proxy headers and upgrade path have been checked against the official release documentation. A compose file in Git is not evidence that the service has been installed or tested.

The initial Compose network is internal. If outbound mail, OAuth, updates or webhook delivery are required, add a narrowly controlled egress path after reviewing the threat model; do not expose the database or bind the application to all interfaces.

## 5. Security baseline

- Separate hosts or at minimum separate trust zones for source hosting, CI runners, deployment control, database and backup.
- Firewall default-deny; expose only the reverse proxy on HTTPS and the explicitly required SSH endpoint.
- MFA for all administrators; disable public registration; least-privilege service accounts.
- Immutable image digests, pinned OS packages, dependency scanning and a documented patch window.
- Secrets in a secret manager or protected host environment, never in Git or browser bundles.
- Encrypted disks where supported; encrypted off-host backups; documented key custody and recovery.
- PostgreSQL private networking, least-privilege roles, RLS tests for exposed user data.
- Audit administrative actions and preserve logs off-host.
- No privileged runner on the RiverGit or database host; ephemeral or isolated workers for untrusted jobs.
- Test upgrades and rollback on staging before production.

## 6. Acceptance gates

A service is not marked operational until the corresponding evidence exists.

1. **Provisioning:** host inventory, OS patch level, firewall, DNS, TLS and resource monitoring recorded.
2. **Install:** pinned image digest, reproducible deployment and clean startup.
3. **Access:** MFA, disabled open registration, admin recovery procedure and least-privilege accounts.
4. **Network:** only required ports reachable; database inaccessible from the public internet.
5. **Persistence:** restart and host-reboot tests preserve expected data.
6. **Backup:** encrypted off-host backup completes and integrity is checked.
7. **Restore:** restore onto a clean independent host succeeds; record measured RPO/RTO.
8. **Security:** vulnerability scan and configuration review have no unresolved critical/high issues.
9. **Operations:** monitoring, alerts, log retention, patching and incident runbooks exist.
10. **Migration:** per-app data/auth/API compatibility, reconciliation and rollback tests pass.

## 7. Current status

| Component | Status |
|---|---|
| Architecture and service boundaries | Documented |
| RiverGit Compose scaffold | Committed; not executed |
| RiverDeploy / Coolify | Selected candidate; installation not started |
| RiverDatabase / Supabase self-hosted | Selected candidate; compatibility review and install not started |
| RiverBackup | Policy specified; tooling and restore test not implemented |
| RiverMonitor | Candidate stack not installed |
| Fortress operational console | Existing design only; not a live control plane |
| Dedicated server(s) | Not selected or provisioned |
| Production migration | Not authorized or started |

## 8. Decisions required before provisioning

No cloud account or VPS should be purchased automatically. Before creating hosts, confirm:
- server provider and country/region;
- monthly budget and storage growth allowance;
- whether the first pilot is a small VPS or existing hardware;
- desired recovery targets (how much data loss/time offline is tolerable);
- domain/subdomain and DNS ownership;
- who holds the recovery keys and administrator MFA.

A low-cost pilot can validate RiverGit first, but production RiverDatabase, build workers and backups need separately sized resources. Do not place all three on one small VM and call it resilient.

## 9. Rollback and coexistence

The current GitHub, Vercel and Supabase services remain authoritative until explicit migration approval. Mirror repositories first; verify commit history and LFS/artifacts if used. Deploy preview applications from RiverDeploy before any DNS cutover. Export and reconcile data before switching database clients. Keep a tested rollback path to the current provider throughout the migration window.

**No merge, production deployment, live Supabase modification, secret change, customer-data transfer or paid server provisioning is included in this implementation.**
