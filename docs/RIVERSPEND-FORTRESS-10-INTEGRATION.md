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
