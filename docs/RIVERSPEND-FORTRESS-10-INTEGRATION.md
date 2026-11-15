# RiverSpend Fortress 10.0 — integration branch

## Purpose
This branch is an isolated integration workspace. It starts from `feat/rivercloud-local-core-2026-11-15` and adds the existing RiverSSAI independent runtime and its 90-role registry from `feat/riverssai-10-independent-core-90`.

## Included in this first integration slice
- RiverCloud local development foundation: PostgreSQL, private API, RiverAuth transition adapter, RLS, backup/restore scripts and its validation workflow.
- RiverSSAI registry: Nova plus 89 specialist roles, grouped into 10 squads.
- RiverSSAI specialist routing and validation script.
- Isolated RiverSSAI runtime: Node.js API, PostgreSQL schema and Ollama inference service, exposed only on loopback port 8787.
- Dedicated GitHub Actions validation for registry/router syntax, Compose configuration and runtime image build.

## Important architectural truth
The 90 entries are specialist roles/prompts executed by a model runtime. They are not 90 separately hosted models or 90 always-on autonomous processes. The current prototype can coordinate up to 30 specialists per request; default parallelism is 1.

RiverCloud and the RiverSSAI prototype currently have separate PostgreSQL instances and separate authentication models. This branch deliberately does **not** merge their databases, migrate users, replace Supabase Auth, connect production applications, change production secrets, or expose either private API publicly. The next design step is a reviewed service boundary and identity model, followed by a least-privilege integration plan.

## Known limitations requiring review before any deployment
- RiverSSAI prototype uses a single owner bearer token and owner-scoped memory; it is not yet a multi-user production identity system.
- RiverCloud currently validates identities through the existing Supabase Auth issuer; it is an adapter, not an independent River ID provider.
- Local Ollama model installation, hardware sizing, TLS ingress, secrets, monitoring, off-host backups, failover and real end-to-end tests remain to be performed.
- RiverCloud restore drill now creates the required non-login policy role in the disposable target before restore and reruns the RLS ownership regression after restore. The updated workflow must pass before RiverCloud is considered validated.
- RiverSSAI container hardening now includes a non-root runtime, read-only root filesystem, dropped capabilities, no-new-privileges, bounded rate-limit memory and PostgreSQL password values that do not require URL encoding. CI must pass on the current head, followed by controlled staging tests.

## Safety and release boundary
- This branch is not production.
- Do not merge or deploy without separate explicit approval.
- Do not modify live Supabase data, production environment variables, payment flows or customer data.
- Keep secrets out of Git; use local ignored .env files or a proper secret manager.
- Require verified backup and restore, authentication and authorization tests, RLS isolation, dependency review, performance tests and rollback procedure before production consideration.

## Initial acceptance gates
1. Registry validation: exactly 90 unique roles, 10 squads, 9 roles per squad and 89 routing maps.
2. JavaScript syntax and router tests pass.
3. Docker Compose config validates with test-only credentials.
4. Runtime image builds.
5. A controlled staging test proves database readiness, Ollama readiness, authenticated chat and audit behavior.
6. Security review closes all critical/high findings.
7. Integration with RiverCloud identity/database is separately designed and tested; no implicit trust between the two prototypes.

## RiverCloud ↔ RiverSSAI service contract (design gate)

The two prototypes must communicate through authenticated APIs, not by sharing tables or database credentials.

1. **User identity authority:** during the transition, RiverCloud continues to validate the existing Supabase Auth bearer token and derive the immutable user UUID. This does not replace the current login provider.
2. **Application gateway:** the browser must call the RiverCloud-facing application API. It must never receive the RiverSSAI administrative token or a database credential.
3. **Service identity:** before enabling chat for end users, RiverCloud must mint a short-lived signed service assertion for RiverSSAI. Required claims: issuer, audience, subject UUID, issued-at, not-before, expiry (maximum five minutes), unique token ID, and explicit scopes such as `ai:chat`, `memory:read`, and `memory:write`.
4. **Key separation:** use an asymmetric signing key held only by the RiverCloud secret manager; RiverSSAI receives only the matching public verification key. Support key IDs and an overlap period for rotation. Never reuse the owner admin token as a service credential.
5. **Per-user authorization:** convert RiverSSAI memory ownership from the current fixed `owner` scope to the verified subject UUID. Every read and write must include that subject and be tested for cross-user isolation. A signed token is not permission to read another user's data.
6. **Service boundary:** RiverCloud and RiverSSAI keep separate databases. RiverCloud owns user/profile identity; RiverSSAI owns AI conversation/memory records. Cross-service calls use versioned APIs with request IDs, bounded timeouts, rate limits and audit records.
7. **Release gates:** contract tests must prove missing/expired/wrong-audience tokens are rejected, scope violations are rejected, two users cannot read or mutate each other's memories, key rotation works, and RiverCloud remains functional when RiverSSAI is unavailable.

This is a design specification only. No shared identity token, production key, live account, or public endpoint has been created or enabled in this branch.

## CI evidence — 15 November 2026

The following isolated GitHub Actions runs completed successfully:

- **RiverSSAI runtime validation:** [run 43738965105](https://github.com/5lordmaul5-del/RiverSpend/actions/runs/43738965105), commit `72938a25c76e371d9250ee83e94b909c54fc4a86`. Passed registry/router assertions (90 unique roles, 10 squads, 89 routing maps), JavaScript syntax checks, Docker Compose validation and standalone image build.
- **RiverCloud lifecycle and recovery:** [run 43739041638](https://github.com/5lordmaul5-del/RiverSpend/actions/runs/43739041638), commit `5a4dfbe2abc45286869dab208bd4faef65289464`. Passed RiverAuth unit tests (4/4), Compose validation, PostgreSQL startup, RLS isolation, stop/restart persistence, encrypted backup, disposable restore, and the post-restore RLS regression. The restore drill reported 2 restored application tables.

An earlier RiverCloud run, [43739008487](https://github.com/5lordmaul5-del/RiverSpend/actions/runs/43739008487), correctly failed at the post-restore RLS test because the dump omitted grants. The restore drill was then updated to recreate the non-login role and reapply only the required schema/table grants; the later run above passed.

**What these results do not prove:** RiverSSAI has not yet completed a live Ollama inference/chat test with PostgreSQL, and neither service has been tested on a dedicated staging host with real TLS, production identity, multi-user authorization, off-site backup or failover. CI success is not production approval.


## RiverSpend Fortress as the Central Operations Plane

The strategic role of Fortress is now defined as the **central operations plane** for the RiverSpend ecosystem. It is not a replacement for every product UI and it is not a monolithic application. It is the shared control and service foundation through which RiverSpend applications are onboarded, authenticated, connected, observed, protected and recovered.

### Operating model

- **Product plane:** RiverSpendShop, River Video / RiverStreaming, Enigma, RiverPrint, RiverSS Print, RiverSignals, RiverSpend PlayStoreShop and future apps retain their own product interfaces and domain logic.
- **Control plane:** Fortress maintains service registry, application identity, policy, configuration references, health state, audit events, release metadata and operational status.
- **Data plane:** application traffic moves through versioned, authenticated APIs. Databases remain service-owned; no universal shared database or unrestricted cross-service SQL access.
- **Recovery plane:** backups, restore drills, off-host copies and documented recovery procedures are independently verifiable. Replication and failover are separate capabilities and must not be claimed until tested.

### Central Operations Console — target capability

The operator console is a later, authenticated administrative interface backed by server-side APIs. Its initial read-only view should report:
1. registered applications and their owner/service boundaries;
2. service health and readiness, with last successful check timestamps;
3. deployment/environment identity and current release version;
4. backup age, last restore-drill result and recovery status;
5. security events, failed authentication trends and audit trail;
6. CI validation status and outstanding release gates.

The console must not expose secrets, raw credentials, unrestricted database access, or administrative tokens to browsers. Any future write/action controls require role-based authorization, explicit confirmation for high-impact actions, audit logging and rollback paths.

### Application onboarding contract

Every application is onboarded through a documented manifest containing a stable app ID, display name, owning team/service, environment, API version, required scopes, health/readiness endpoints, data classification, backup owner, and release/rollback reference. Secrets are referenced from a secret manager; they are never stored in the manifest or repository.

### Delivery sequence and acceptance gates

1. **Inventory and registry:** enumerate actual repository apps, services, branches and deployment targets; mark unknown or unverified items as such. Include RiverSS Print explicitly.
2. **Identity and service trust:** implement the RiverCloud-to-RiverSSAI short-lived signed assertion contract, per-user UUID scoping and cross-user isolation tests before user-facing AI integration.
3. **Gateway and registry API:** define versioned app/service registration and authenticated routing without exposing private databases.
4. **Observability:** standard health/readiness contracts, structured logs, correlation/request IDs, metrics and alert thresholds.
5. **Backup and recovery:** independent off-host backup policy, encryption/key custody, scheduled restore drills and documented RPO/RTO targets validated by exercises.
6. **Operator console:** build a read-only operational dashboard against real service APIs and CI/deployment evidence; only later add carefully permissioned actions.
7. **Staging integration:** run end-to-end tests on an isolated staging environment before any production proposal.

### Boundaries

This document changes the architecture target, not production state. The current branch remains isolated. No production deployment, merge, live database migration, payment activation, customer-data access or production secret change is authorized by this design. The console and central control plane must not be described as operational until implemented and demonstrated against real services.


## Central application registry — first implementation

The first machine-readable central registry is stored at `registry/river-apps.registry.json`. It separates product applications from shared Fortress platform services and assigns stable IDs. Initial application entries are explicitly marked `identified_unverified`: they are project inventory candidates, not claims that a repository, deployment, runtime or live endpoint has been verified.

The registry includes RiverSS Print as a distinct entry. Unknown repository paths, deployment URLs, environments, runtimes, owners, API versions and health endpoints remain null until verified from source evidence.

Validation is implemented in `scripts/river-registry/validate.mjs` and runs through `.github/workflows/river-registry-validation.yml`. The validator checks JSON readability, unique IDs and required inventory fields. Passing this validation proves registry structure only; it does not verify application existence, deployment health or production status.

Next inventory work: inspect repository trees and deployment metadata, then replace each initial status only when evidence supports it. Do not infer deployment URLs or health endpoints from names.


## RiverSSAI and RiverSS Print application surfaces

- RiverSSAI is served by the dedicated `/river-ai` Next.js route in the RiverSpend web project, with its own PWA manifest and service worker; it is not a separate Vercel project.
- The RiverSSAI launcher artwork is `public/icons/river-ssai-app.svg`. The manifest and page favicon/header use this SVG; the existing 180px PNG remains the Apple touch icon fallback, while the 192px and 512px PNGs remain compatibility fallbacks in the manifest.
- RiverSS Print is represented by `/river-print` and `public/icons/river-ss-print.svg`. The current page is an informational placeholder only: no catalog, customization, quote, order, payment or production workflow is active.
- These routes remain part of the isolated Fortress branch until separately approved for production publication. Device installation icons and route behavior require a post-build browser/device smoke test.
