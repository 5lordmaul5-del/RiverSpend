# RiverSpendCloud — powered by RiverSSAI

RiverSpendCloud is the planned private cloud layer for the RiverSpend ecosystem. RiverSSAI is its central intelligence and orchestration service.

This repository currently contains an isolated, self-hostable PostgreSQL + Ollama + RiverSSAI API prototype. It is **not yet a deployed cloud service** and is not connected to the live RiverSpendShop UI.

## Ownership and portability principles
- RiverSpend owns the application code, data model, and export/restore procedures.
- PostgreSQL is the portable system of record; do not make provider-specific database features mandatory.
- Object storage should use an S3-compatible interface so files can move between providers or to owned infrastructure.
- AI inference must sit behind a provider-neutral adapter: local Ollama for self-hosting, or a free-tier cloud inference provider during the initial zero-budget phase.
- Keep secrets server-side. Never expose database credentials or the RiverSSAI admin token to browser code.
- Maintain independent encrypted backups and regularly test restores.
- Do not migrate or delete live data until exports, integrity checks, and restore tests pass.

## Planned architecture
- **RiverDB:** PostgreSQL data layer.
- **RiverStorage:** S3-compatible object/file storage.
- **RiverSSAI:** AI and orchestration API, with interchangeable inference providers.
- **RiverBackup:** encrypted, independently restorable backups.
- **RiverSecurity:** authentication, authorization, audit, and secret management.
- **RiverSync:** APIs and synchronization between RiverSpend applications.

## Current prototype services
- PostgreSQL 17: RiverSSAI memory and audit log.
- Ollama: local model inference (default Qwen 2.5 7B).
- RiverSSAI API: owner-token protected HTTP API.

## Run the self-hosted prototype on Linux
1. Install Docker Engine and the Docker Compose plugin.
2. Copy this repository to the host.
3. In `infra/river-ai`, create a private `.env` file with:
   - `RIVERDB_PASSWORD`: long random database password.
   - `RIVER_AI_ADMIN_TOKEN`: random secret of at least 32 characters.
   - `RIVER_AI_LOCAL_MODEL`: model suitable for available RAM/CPU/GPU (default `qwen2.5:7b`).
4. Start: `docker compose up -d --build`.
5. Pull the model once: `docker compose exec ollama ollama pull qwen2.5:7b`.
6. Check locally: `curl http://127.0.0.1:8787/health`.
7. Put a TLS reverse proxy (Caddy or Nginx) in front of port 8787. Keep PostgreSQL and Ollama private; never expose ports 5432 or 11434 publicly.

## API
- `GET /health`: health check, no secret data.
- `POST /v1/chat`: JSON `{"messages":[{"role":"user","content":"Ciao Nova"}]}`, Bearer admin token.
- `POST /v1/memories`: JSON `{"title":"...","content":"...","category":"note"}`, Bearer admin token.

## Zero-budget development phase
The zero-budget phase can use free-tier managed services for testing, but those services remain external dependencies and have quotas, suspension policies, and availability limits. Keep the application portable and never describe a free-tier deployment as fully independent infrastructure. Before selecting providers, verify current free-tier terms, data export options, regions, backup capabilities, and whether a payment method is required.

The first cloud deployment must be a separate development/staging environment. Do not replace production Supabase, change production environment variables, or move products, customers, orders, or payment data without verified exports, integrity checks, tested restores, and explicit approval.

## Backup and recovery
Back up PostgreSQL with scheduled `pg_dump` to storage outside the database provider. Keep encrypted copies and test restores. A database volume or provider snapshot alone is not a complete recovery plan.

## Current limitations
This prototype is intentionally isolated from the live RiverSpendShop database. It does not migrate or modify products, customers, orders, payments, or existing Supabase data. The website UI is not switched to this API. A deployment target, secrets, TLS, inference provider, backup destination, authentication integration, and end-to-end acceptance tests are still required before production use. A local model is not automatically free: compute and storage have costs.
