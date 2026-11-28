# RiverSpendCloud — powered by RiverSSAI

RiverSpendCloud is the planned private cloud layer for the RiverSpend ecosystem. RiverSSAI is its central intelligence and orchestration service.

This integration branch brings the self-hostable PostgreSQL + Ollama runtime, 90-role RiverSSAI registry and specialist router alongside the RiverCloud development foundation. The AI runtime remains a separate isolated service and is **not deployed** or **connected to the live RiverSpendShop UI**.

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

Before installation, run `bash infra/river-ai/owner-host-preflight.sh` to check Docker, Compose and prerequisite availability without exposing secrets. Then use `bash infra/river-ai/start-owner-host.sh` for the guided bootstrap; it creates the private environment file and performs readiness plus a local inference smoke test. The bootstrap is intended for an owner-controlled Linux host.
1. Install Docker Engine and the Docker Compose plugin.
2. Copy this repository to the host.
3. In infra/river-ai, create a private .env file with:
   - RIVERDB_PASSWORD: long random database password (any characters are supported; it is passed as a password value, not embedded in a URL).
   - RIVER_AI_ADMIN_TOKEN: random secret of at least 32 characters.
   - RIVER_AI_LOCAL_MODEL: model suitable for available RAM/CPU/GPU (default qwen2.5:7b).
4. Start: docker compose up -d --build.
5. Download the model once: docker compose exec ollama ollama pull qwen2.5:7b.
6. Check liveness: curl http://127.0.0.1:8787/health.
7. Check readiness after the model download: curl http://127.0.0.1:8787/ready.
8. Put a TLS reverse proxy (Caddy or Nginx) in front of port 8787. Keep PostgreSQL and Ollama private; never expose ports 5432 or 11434 publicly.

**Network note:** PostgreSQL and the RiverSSAI API use an internal Docker network. Ollama joins that private network and a separate outbound Docker network so it can download model weights. Ollama has no published host port; the RiverSSAI API is the only published service and is bound to 127.0.0.1. The RiverSSAI container runs as the unprivileged Node user, with a read-only root filesystem, dropped Linux capabilities, and no-new-privileges enabled.

## API
GET /health and GET /ready are public status endpoints and do not return secrets. All /v1 endpoints require the owner Bearer token.
- GET /health: liveness check for the API and PostgreSQL.
- GET /ready: readiness check for PostgreSQL and the configured Ollama model.
- GET /v1/agents: list the 90-role registry and 10 squads.
- POST /v1/chat: send messages; optional agent selects one registered role, or agent: "team" with teamSize of 2, 4, 8, 10, 20, or 30 asks Nova to coordinate relevant specialists.
- POST /v1/memories: store an owner memory.

Example chat request:
~~~json
{"agent":"team","teamSize":4,"messages":[{"role":"user","content":"Controlla la sicurezza del server"}]}
~~~

**Identity limitation:** this is still a single-owner development prototype. The Bearer token is an administrative credential and memory rows use one fixed owner scope. It is not yet a multi-user identity system and must not be connected to public user accounts or production customer data. River ID/RiverAuth and per-user authorization must be completed and tested first.

## Zero-budget development phase
Free-tier managed services can be used for isolated testing, but they remain external dependencies with quotas, suspension policies, and availability limits. Do not describe a free-tier deployment as fully independent infrastructure. A local model is not automatically free: compute, storage, electricity, and connectivity have costs.

The first cloud deployment must be a separate development/staging environment. Do not replace production Supabase, change production environment variables, or move products, customers, orders, or payment data without verified exports, integrity checks, tested restores, and explicit approval.

## Backup and recovery
Back up PostgreSQL with scheduled pg_dump to storage outside the database host. Keep encrypted copies and test restores. A database volume or provider snapshot alone is not a complete recovery plan.

## Optional RiverSSAI website adapter (staging only)

The Next.js chat API supports an explicit server-side provider switch. It remains on Groq by default. Do not switch it until the standalone RiverCloud host is deployed, TLS is active, and the readiness endpoint returns HTTP 200.

For a **Preview/staging deployment only**, configure these server-side environment variables in Vercel:
- `RIVER_AI_PROVIDER=standalone`
- `RIVER_AI_STANDALONE_URL=https://your-private-rivercloud-host` (origin only; do not append `/v1/chat`)
- `RIVER_AI_ADMIN_TOKEN`: the same strong token configured on the standalone RiverSSAI host (at least 32 characters).

Keep `RIVER_AI_ADMIN_TOKEN` as a server-only secret. Never use a `NEXT_PUBLIC_` variable for it and never place it in browser or Android code. The adapter still verifies the Supabase user session and the owner-access tier before forwarding a request. It forwards a bounded conversation context and selected agent/team size over HTTPS. If the standalone provider is selected but its URL/token is missing, the API fails closed; it does not silently fall back to Groq.

The standalone runtime currently uses a single-owner administrative token and owner memory scope. This adapter is therefore for the owner-only staging test, not public multi-user chat. Do not enable it in Production until RiverAuth/per-user authorization, request auditing, timeout/load tests, backup/restore, and two-account isolation tests are complete.

## Current limitations
This prototype remains isolated from the live RiverSpendShop database. It does not migrate or modify products, customers, orders, payments, or existing Supabase data. The website UI is **not switched** to the standalone API unless the explicit staging environment variables above are configured. A persistent host, TLS, secrets, model sizing, backup destination, authentication integration, and end-to-end acceptance tests are still required before production use.


## Autonomous worker queue (isolated runtime)

The standalone RiverCloud runtime includes a durable PostgreSQL queue and a separate `river-ai-worker` service. The API process initializes `worker-queue.sql` at startup. Workers claim jobs atomically with `FOR UPDATE SKIP LOCKED`, receive a time-limited lease, and persist success/failure events. Expired leases are re-queued; failed jobs use bounded exponential retry and eventually enter `dead_letter`. The initial worker concurrency defaults to **1** and is capped at 2 until host capacity is measured.

### Queue API (owner token only)
- `POST /v1/jobs` with `{ "agentKey": "tech", "task": "Review the API design" }` returns HTTP 202 and a job ID.
- `GET /v1/jobs/<job-uuid>` returns status, attempts, result, and error information.
- Jobs are analysis tasks only. The worker does not execute shell commands, modify repositories, publish content, or perform payments.
- The admin bearer token must stay server-side. Do not expose it in browser JavaScript or mobile app bundles.

### Start and validate
Run `docker compose up -d --build`, then check `docker compose ps`, `curl http://127.0.0.1:8787/health`, and `curl http://127.0.0.1:8787/ready`. Submit a test job only after readiness is green. Check its status using the returned UUID. Keep concurrency at 1 for the first host test. This worker stack remains separate from production Supabase and the live RiverSpendShop until a separate migration, security review, restore test, and explicit production rollout.


## Owner memory management
All memory management endpoints require the private owner Bearer token. Keep it out of browser code, logs, and shared screenshots.
- `GET /v1/memories`: list the latest 100 owner memories.
- `PUT /v1/memories/:id`: edit one memory.
- `DELETE /v1/memories/:id`: delete one memory.
- `GET /v1/memories/export`: export up to 1000 owner memories as JSON. Store exports securely.
- `POST /v1/memories/import`: restore/import 1–100 validated memory records per request from JSON payload `{ "memories": [{ "title": "...", "content": "...", "category": "note", "source": "backup" }] }`. Import is transactional; on failure, it rolls back. Larger exports should be imported in batches of 100 or fewer. Import adds records; it does not overwrite or deduplicate existing records.

Memory backup and restore have not yet been verified against a live owner-host installation. Exercise export/import on a disposable test database before relying on them for disaster recovery.


## Verification sequence before relying on the runtime
Run this only against a disposable installation/database with no production or personal records. Do not use a production owner token for tests.

1. Start the owner-host runtime and wait until `/ready` returns HTTP 200.
2. Verify missing/incorrect Bearer tokens are rejected on all `/v1` endpoints (HTTP 401; rate limiting may return 429 after repeated probes).
3. With a disposable owner token, add one test memory via `POST /v1/memories`; verify list retrieval and correct owner scope.
4. Export via `GET /v1/memories/export`; save the JSON outside the repository and verify it contains the test record.
5. Import the exported record in a separate disposable DB or clear test namespace. Confirm the count and record contents. Import adds entries, so repeated imports intentionally create duplicates.
6. Send malformed JSON, missing title/content, an empty array, and more than 100 entries; expect validation errors and no partial inserts.
7. Simulate DB interruption during import in the disposable environment; verify transaction rollback leaves no partial records.
8. Restart API/worker and database containers; verify readiness and that memory persists. Check worker jobs separately for queue persistence and lease recovery.
9. Keep evidence (test output, runtime versions, host specs) in a private test report. Do not commit secrets or personal memory exports.

This sequence is a manual acceptance plan, not evidence that these host tests have already run.


## Disposable memory API smoke test
After starting the isolated owner runtime, run `RIVER_AI_ADMIN_TOKEN=... bash infra/river-ai/memory-api-smoke-owner.sh` (or set the token in your private shell environment). Optionally set `RIVER_AI_BASE_URL`. This script requires curl and jq and checks unauthorized access rejection, imports a uniquely tagged synthetic memory, verifies list/export, then deletes only its own synthetic record. It does not test model inference or database outage rollback. Run only against a disposable owner runtime, not production data.
