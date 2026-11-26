# RC-151 — RiverSpend portability and continuity plan

**Purpose:** reduce single-provider dependency and establish an exportable, recoverable operating path.
**Scope:** practical staged plan; no migrations or deployments performed.
**Safety:** no credentials copied, no destructive actions, no production changes.

## Continuity goals
- Maintain an independently restorable copy of source code, issues/PR metadata where feasible, release notes, and deployment configuration.
- Keep a documented path to build and deploy without Vercel-specific assumptions.
- Keep application data exportable and restorable independently of any hosted database provider.
- Preserve domain/DNS ownership and record recovery procedures.
- Keep secrets out of repository and backups unless encrypted and access-controlled.

## Track 1 — source control
- [ ] Establish periodic full Git mirror to a storage location under owner control.
- [ ] Verify mirror integrity and test restoration into a second Git forge or standalone Git service.
- [ ] Export important PR/issues/wiki/release data separately; a Git mirror alone does not contain all metadata.
- [ ] Document access recovery, MFA recovery codes, owner accounts and trusted administrators.
- [ ] Keep a locally buildable snapshot of release candidates.

Candidate secondary forge: self-hosted Forgejo/Gitea or another Git-compatible service. Evaluate maintenance, backups, security updates, and internet access before relying on it.

## Track 2 — build and deployment portability
- [ ] Identify Vercel-specific runtime, routing, storage, secrets, build and cron dependencies.
- [ ] Provide reproducible Node build instructions and pinned dependency lockfiles.
- [ ] Document environment-variable inventory by name, purpose and environment; never store values in docs.
- [ ] Test Next.js build/run in a container or ordinary Node host.
- [ ] Document deployment rollback and smoke tests.
- [ ] Evaluate a second deployment target (container VPS/self-hosted) and test only in a non-production environment.

## Track 3 — database and storage portability
- [ ] Identify Supabase dependencies (Auth, PostgreSQL, Storage, Realtime, Functions, RLS).
- [ ] Produce encrypted database backup/export procedure.
- [ ] Test restore to independent PostgreSQL; verify schema, data, indexes, extensions and policies.
- [ ] Export storage objects and metadata; validate restore.
- [ ] Document auth migration and user identity implications; avoid assuming compatible auth.
- [ ] Test application behavior with a non-production independent backend before any production migration.

## Track 4 — provider and AI portability
- [ ] Keep provider adapters behind River API contracts.
- [ ] Define provider-neutral model selection, timeout, retry, quotas, telemetry and error contracts.
- [ ] Do not embed credentials in clients or repository.
- [ ] Test one local model runtime and one alternate provider only in isolated environments, when resources permit.
- [ ] Track licensing, hardware requirements, data handling and costs.

## Track 5 — domain, DNS and operational continuity
- [ ] Confirm domain registrar access and account recovery.
- [ ] Document DNS records and TTL strategy without exposing sensitive credentials.
- [ ] Keep a provider-neutral deployment/runbook.
- [ ] Establish encrypted off-site backups with retention and restore tests.
- [ ] Define recovery priority: source → build → database → storage → auth → domain/DNS → service integrations.

## Proposed practical sequence
1. Create a Git mirror and verify clone/restore.
2. Inventory provider-specific dependencies and environment variables.
3. Create an encrypted backup and perform a non-production PostgreSQL restore test.
4. Containerize or document the build and test on an independent host.
5. Evaluate a secondary forge and deployment target.
6. Gradually remove provider-specific coupling through adapters.
7. Conduct a recovery drill and document results.

## Completion criteria
Portability is not complete merely because backups exist. Demonstrate restoration of source, database and storage; build and run the application on an alternate host; document limitations; and verify the domain recovery path. Do not migrate or cut over production until explicitly approved.
