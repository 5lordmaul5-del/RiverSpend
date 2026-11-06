# RiverSSAI Independent Core

This is a separate, self-hosted runtime. It does not import Supabase or call Supabase Auth, Database, or Storage.

## Services
- PostgreSQL 17: RiverSSAI memory and audit log.
- Ollama: local model inference (default Qwen 2.5 7B).
- RiverSSAI API: owner-token protected HTTP API.

## Deploy on a Linux VPS
1. Install Docker Engine and the Docker Compose plugin.
2. Copy this repository to the VPS.
3. In `infra/river-ai`, create a private `.env` file with:
   - `RIVERDB_PASSWORD`: long random database password.
   - `RIVER_AI_ADMIN_TOKEN`: random secret of at least 32 characters.
   - `RIVER_AI_LOCAL_MODEL`: model suitable for the VPS RAM/CPU/GPU (default `qwen2.5:7b`).
4. Start: `docker compose up -d --build`.
5. Pull the model once: `docker compose exec ollama ollama pull qwen2.5:7b`.
6. Check locally: `curl http://127.0.0.1:8787/health`.
7. Put a TLS reverse proxy (Caddy or Nginx) in front of port 8787. Keep PostgreSQL and Ollama private; never expose ports 5432 or 11434 publicly.

## API
- `GET /health`: health check, no secret data.
- `POST /v1/chat`: JSON `{"messages":[{"role":"user","content":"Ciao Nova"}]}`, Bearer admin token.
- `POST /v1/memories`: JSON `{"title":"...","content":"...","category":"note"}`, Bearer admin token.

## Backup and recovery
Back up the PostgreSQL volume with scheduled `pg_dump` to storage outside this VPS. Keep encrypted off-server copies and test restores. Docker volumes alone are not backups.

## Important limitations
This core is intentionally isolated from the live RiverSpendShop database. It does not migrate or modify products, customers, orders, payments, or existing Supabase data. The website UI is not switched to this API by this commit. A VPS, DNS/TLS, secrets, model download, resource sizing, backup destination, and end-to-end acceptance tests are required before production use. A local model is not automatically "free": the VPS and its operation have costs.
