# RiverSSAI 10.0 — Runnable Core (F1)
Small dependency-free localhost runtime, independent of marketplace, Supabase and Vercel. This is a foundation, **not yet an autonomous AI or connected model**.
## Requirements
Node.js 22+
## Run
```sh
cd river-ai
npm test
npm start
```
Default address: 127.0.0.1:3030
- GET /health — health
- GET /status — configuration and capability status
- GET /tools — declared tool registry (write actions disabled)
- GET /memory — inspect local memory (read-only endpoint)
Memory module supports local add/delete/clear functions for future integrations; these writes are not exposed through HTTP. Memory stores locally with restrictive permissions where supported. Avoid sensitive data.
No provider, secrets, database, public network integration or deployment is enabled. Non-GET methods and unknown routes are rejected.
Next: provider adapters, memory consent/UI, sandboxed tools with approval, evaluation/security testing. Never expose publicly without authentication, TLS, rate limits and review.

## Provider adapter groundwork
A provider-neutral interface and mock adapter exist for tests only. They do not connect to or simulate a live model. Real providers are a future milestone requiring explicit configuration, secrets handling, and tests.