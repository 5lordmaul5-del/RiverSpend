# RiverSpendCloud — powered by RiverSSAI

RiverSpendCloud is the planned private cloud layer for the RiverSpend ecosystem. RiverSSAI is its central intelligence and orchestration service.

This branch contains an isolated self-hostable PostgreSQL + Ollama runtime with the 90-role RiverSSAI registry and a specialist router. It is **not deployed** and is **not connected to the live RiverSpendShop UI**.

## Ownership and portability principles
- RiverSpend owns the application code, data model, and export/restore procedures.
- PostgreSQL is the portable system of record; provider-specific database features must not become mandatory.
- Object storage should use an S3-compatible interface so files can move between providers or to owned infrastructure.
- AI inference runs through Ollama locally; the runtime must not require Gemini, Groq, OpenAI, or another cloud AI provider.
- Keep secrets server-side. Never expose database credentials or the RiverSSAI admin token to browser code.
- Maintain independent encrypted backups and regularly test restores.
- Do not migrate or delete live data until exports, integrity checks, and restore tests pass.

## Architecture
- **RiverDB:** PostgreSQL data layer for memory and audit.
- **RiverSSAI:** Node.js API and Nova orchestration.
- **Ollama:** local inference engine, default model qwen2.5:7b.
- **90 registered roles:** Nova plus 89 specialists organized into 10 squads.
- **RiverBackup:** planned encrypted, independently restorable backups.
- **RiverSecurity:** planned authentication, authorization, audit, and secret management.
- **RiverSync:** planned APIs and synchronization between RiverSpend applications.

The 90 entries are registered specialist roles, not 90 always-running independent models. A request can invoke up to 30 specialists; the default concurrency is 1 to protect machines with limited RAM/compute. Raise it to 2 only after measuring the host.

## Run the self-hosted prototype on Linux
1. Install Docker Engine and the Docker Compose plugin.
2. Copy this repository to the host.
3. In infra/river-ai, create a private .env file with:
   - RIVERDB_PASSWORD: long random database password.
   - RIVER_AI_ADMIN_TOKEN: random secret of at least 32 characters.
   - RIVER_AI_LOCAL_MODEL: model suitable for available RAM/CPU/GPU (default qwen2.5:7b).
4. Start: docker compose up -d --build.
5. Download the model once: docker compose exec ollama ollama pull qwen2.5:7b.
6. Check locally: curl http://127.0.0.1:8787/health.
7. Put a TLS reverse proxy (Caddy or Nginx) in front of port 8787. Keep PostgreSQL and Ollama private; never expose ports 5432 or 11434 publicly.

**Network note:** PostgreSQL and the RiverSSAI API use an internal Docker network. Ollama joins that private network and a separate outbound-only Docker network so it can download model weights. Ollama has no published host port; the RiverSSAI API is the only published service and is bound to 127.0.0.1.

## API
All endpoints except GET /health require the owner Bearer token.
- GET /health: health check and registered-role/squad counts.
- GET /v1/agents: list the 90-role registry and 10 squads.
- POST /v1/chat: send messages; optional agent selects one registered role, or agent: "team" with teamSize of 2, 4, 8, 10, 20, or 30 asks Nova to coordinate relevant specialists.
- POST /v1/memories: store an owner memory.

Example chat request:
~~~json
{"agent":"team","teamSize":4,"messages":[{"role":"user","content":"Controlla la sicurezza del server"}]}
~~~

## Zero-budget development phase
Free-tier managed services can be used for isolated testing, but they remain external dependencies with quotas, suspension policies, and availability limits. Do not describe a free-tier deployment as fully independent infrastructure. A local model is not automatically free: compute, storage, electricity, and connectivity have costs.

The first cloud deployment must be a separate development/staging environment. Do not replace production Supabase, change production environment variables, or move products, customers, orders, or payment data without verified exports, integrity checks, tested restores, and explicit approval.

## Backup and recovery
Back up PostgreSQL with scheduled pg_dump to storage outside the database host. Keep encrypted copies and test restores. A database volume or provider snapshot alone is not a complete recovery plan.

## Current limitations
This prototype is intentionally isolated from the live RiverSpendShop database. It does not migrate or modify products, customers, orders, payments, or existing Supabase data. The website UI is not switched to this API. A deployment target, secrets, TLS, model sizing, backup destination, authentication integration, and end-to-end acceptance tests are still required before production use.
