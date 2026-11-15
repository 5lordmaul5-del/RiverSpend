# River DataCenter RSS — Master Blueprint and Ecosystem Inventory

**Document status:** architecture baseline and inventory, not a live data center  
**Branch:** `feat/river-fortress-integration-core`  
**Cost constraint:** €0. No paid cloud, domain, service, subscription, or provisioning.  
**Production boundary:** no merge, production deployment, live database changes, data migration, payment activation, or secret changes.

## 1. Mission

River DataCenter RSS is the proposed coordination and infrastructure layer for the RiverSpend ecosystem. It is not one giant application or one physical server. It is a collection of independently recoverable services connected through authenticated, versioned APIs.

The design has five planes:
- **Product plane:** user-facing River applications retain their own interfaces and domain logic.
- **Control plane:** River DataCenter RSS / Fortress maintain inventory, policy, service identity, configuration references, health and release evidence.
- **Data plane:** apps access service-owned data through authenticated APIs; no universal database and no unrestricted cross-app SQL.
- **Security plane:** River ID/RiverAuth, River Security, least privilege, audit and secret handling.
- **Recovery plane:** RiverBackup and RiverRecovery provide independent backups, restore drills and documented recovery.

## 2. Official product and application inventory

The following is the current project inventory, not a claim that every item is implemented or deployed. Entries without verified repository paths remain concepts/candidates.

| # | Official name | Purpose / boundary | Current evidence |
|---:|---|---|---|
| 1 | RiverSpend | Main commerce ecosystem and web application | Root Next.js application observed; production health not established |
| 2 | RiverSpendShop | Native shopping application | Expo source at `apps/riverspendshop`; store release not verified |
| 3 | River Video | Separate video app/product | Project concept; source path and deployment not verified |
| 4 | RiverStreaming | Video and streaming platform | Expo source at `apps/riverspendstream`; exact product mapping and distribution not verified |
| 5 | Enigma / Christopher | Encrypted messaging concept for text, photos and video | Concept; implementation and cryptographic review not verified |
| 6 | RiverPrint | Printing service/product | Project concept; source and workflows not verified |
| 7 | RiverSS Print | Separate print application surface | Placeholder route `/river-print`; catalog, customization, quotes, orders, payments and production are not active |
| 8 | RiverSignals | Signals and communications | Vercel project/domain observed; source ownership and current health not verified |
| 9 | RiverSpaceSignals | Signals/community concept | Project context only; source and deployment not verified |
| 10 | RiverSpend PlayStoreShop | Digital marketplace | Project concept; source and deployment not verified |
| 11 | RiverSpend PlayStoreGamesShop | Games marketplace | Project concept; source and deployment not verified |
| 12 | RiverS PlayS | Games and entertainment | Project concept; source and deployment not verified |
| 13 | Quiz Arena | Interactive quiz/game | Project concept; source and deployment not verified |
| 14 | Karma Relax Zen | Wellness concept | Project concept; source and deployment not verified |
| 15 | River AI – Karma Guardian | AI assistant concept | Project concept; source and deployment not verified |
| 16 | RiverSpend Panel Control (RSPC) | Administrative/control app | Expo source at `apps/riverspend-panel-control`; deployment mapping not verified |
| 17 | RiverSSAI 10.0 | AI assistant application/platform | Next.js route `/river-ai`, PWA assets and chat API source observed; live readiness not verified |

**Naming boundaries:** River Video and RiverStreaming are separate entries until their relationship is explicitly decided. RiverPrint and RiverSS Print are separate products. Enigma's machine name is Christopher; that does not imply that the secure messaging service is already implemented.

## 3. Shared platform and infrastructure catalogue

| Name | Responsibility | Current state |
|---|---|---|
| River DataCenter RSS | Overall architecture, service map, inventory and coordination | Design only |
| RiverCloud | Cloud foundation: compute, network, storage, ingress and service connectivity | Partial design/scaffolding; no host provisioned |
| RiverGit | Own Git hosting based on Forgejo; repositories and history | Compose scaffold only; not installed |
| RiverDeploy | Self-hosted build/preview/deployment control, candidate Coolify | Candidate/design only |
| RiverDatabase / River Database | Data platform; candidate official Supabase self-hosted distribution | Design only; not installed |
| River ID / RiverAuth | Shared identity, authentication and authorization | Design/partial work; not an independent production identity service |
| RiverSSAI 10.0 | AI application/service, model orchestration and specialist routing | Existing application work; integration and production readiness not established |
| River API Gateway | Versioned, authenticated service-to-service API entry | Design/partial work |
| River Payments | Payment orchestration boundary | Design only; no live payment processing |
| River Security | Security policy, access control and audit | Design/partial work |
| RiverBackup / River Backup | Encrypted backups and backup verification | Policy/scaffold; no offsite target or successful restore drill |
| RiverRecovery / River Recovery | Disaster recovery and restore orchestration/runbooks | Design/partial work |
| RiverMonitor / River Monitor | Health, metrics, logs and alerts | Design/partial work |
| River Fortress 10.0 | Central operational control plane and policy coordination | Architecture/registry work; not a live control console |

## 4. Target connection model

1. Each app receives a stable app ID in the central registry.
2. Each app authenticates through River ID when that service is implemented and security-tested.
3. Apps call only the API scopes they are granted through River API Gateway.
4. Each domain service owns its data and database roles.
5. RiverSSAI receives only explicitly authorized, scoped context; it does not get unrestricted access to every app database.
6. RiverMonitor consumes health/readiness and operational signals, not secret values.
7. RiverBackup backs up service-owned data and configuration using separate credentials and off-host storage when available.
8. RiverRecovery documents and tests restoration independently of the primary host.
9. River DataCenter RSS / Fortress presents the inventory and verified state. It must not become a single point of failure for user-facing traffic.

## 5. Target logical topology

```text
                   RIVER DATACENTER RSS
                (inventory + coordination)
                            |
                    RIVER FORTRESS 10.0
              policy / audit / release / status
                            |
       +--------------------+--------------------+
       |                    |                    |
   RIVER ID             RIVER API             RIVER MONITOR
  / RIVERAUTH            GATEWAY                 |
       |                    |               health / metrics
       +--------------------+--------------------+
                            |
          +-----------------+------------------+
          |                 |                  |
     RIVER SSAI         COMMERCE            MEDIA / SOCIAL
       10.0             SERVICES               SERVICES
          |                 |                  |
       own data           own data            own data
          +-----------------+------------------+
                            |
                    RIVER DATABASE
              (service-owned DB boundaries)
                            |
                  RIVER BACKUP / RECOVERY

Build and source lifecycle:
RiverGit -> isolated CI runners -> RiverDeploy -> Preview/staging
No automatic production cutover.
```

This is a logical target, not a deployed network diagram.

## 6. Infrastructure choices and constraints

- **RiverGit:** Forgejo + PostgreSQL. Keep the database private. CI runners are separate isolated workers because repository workflows execute code.
- **RiverDeploy:** Coolify is the candidate for deployment orchestration. It does not replace Git hosting.
- **RiverDatabase:** use the official Supabase self-hosted distribution only after version pinning, feature-gap review, security review and capacity planning. Self-hosted Supabase is not feature-identical to Supabase Managed.
- **RiverBackup:** use encrypted, independently held backups. A second folder or volume on the same host is not an offsite backup.
- **RiverMonitor:** monitor host, disk, certificates, service readiness, backup freshness and failed jobs.
- **RiverCloud:** separate trust zones for source hosting, CI, deployment, database and backups. Avoid one small VM for every role.
- **Laptop:** administration/development workstation only; it is not the always-on production server.

## 7. Zero-cost execution sequence

### Stage 0 — inventory and local validation
- Keep the registry as the source of truth for app IDs and verification status.
- Audit repository paths, package manifests, routes, API endpoints and deployment mappings.
- Prepare local development and encrypted local backup of source/documentation.
- Do not store secrets or private keys in Git or chat.

### Stage 1 — RiverGit local pilot
- Validate Compose syntax and pinned image references.
- Run Forgejo and PostgreSQL locally only if the laptop has sufficient resources.
- Test create/clone/push, persistence after restart, backup and restore.
- Do not make RiverGit the only copy of any repository.

### Stage 2 — RiverBackup local rehearsal
- Create encrypted test backups of non-sensitive sample data.
- Restore into a clean local environment.
- Record what is and is not covered. Local-only backups do not protect against laptop loss.

### Stage 3 — RiverDeploy local sample
- Evaluate Coolify requirements and compatibility without purchasing a host.
- Use a disposable sample app, never a production app or production secret.
- Test build, preview, health check, logs and rollback locally if feasible.

### Stage 4 — RiverDatabase evaluation
- Pin an official self-hosted release.
- Compare required Auth, Storage, Realtime, Edge Functions, extensions, SMTP/OAuth and operational features.
- Test RLS and backup/restore using synthetic data only.
- Do not migrate live Supabase data.

### Stage 5 — integration contracts and console
- Define API versioning, service identity, scopes, correlation IDs and error contracts.
- Build a read-only operations view only when it can consume real, authenticated evidence.
- Mark unavailable services as unavailable; never fabricate green health indicators.

### Stage 6 — migration proposal
- Only after all previous gates, prepare a per-app dual-run and rollback proposal.
- Any paid hosting, domain, migration, live DB modification, merge or production deployment requires a separate explicit approval. Under the current €0 rule, paid provisioning remains prohibited.

## 8. Verification and status rules

Use these labels consistently:
- **Concept:** name/idea exists, no verified source implementation.
- **Design:** architecture or specification exists.
- **Scaffold:** configuration/code exists but has not been run in its target environment.
- **Implemented:** code path exists and relevant tests pass.
- **Preview verified:** exact commit is deployed to Preview and browser/API smoke tests pass.
- **Production verified:** exact production release and health are tested.
- **Recovery verified:** independent backup restored successfully and measured recovery evidence is recorded.

A green CI check proves only the checks it actually ran. A READY deployment does not prove that the latest commit is deployed or that the app works. Never call a service resilient without independent failure domains and tested recovery.

## 9. Explicit non-goals and safety limits

- No spending, paid trial, paid VM, paid domain or subscription.
- No production deploy, merge, DNS cutover or destructive operation.
- No live Supabase schema changes or user-data migration.
- No real payments or payment credentials.
- No claim of end-to-end encryption for Enigma until cryptographic design, implementation and independent review exist.
- No assumption that every named concept has a repository, endpoint or app-store package.
- No shared super-database or universal admin token for every application.

## 10. Immediate next engineering tasks

1. Validate the central registry and expand it only with evidence-backed entries.
2. Add a machine-readable architecture/service map and consistency validator.
3. Validate RiverGit Compose and document local test prerequisites.
4. Create a zero-cost local test plan for RiverGit and RiverBackup.
5. Audit all app folders and identify missing product mappings.
6. Add service health contracts and API versioning templates before wiring apps together.

**Current truth:** this blueprint and registry document the target architecture. They do not mean River DataCenter RSS, RiverGit, RiverDeploy, RiverDatabase, offsite backup or the unified network are already running.
