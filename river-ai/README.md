# RiverSSAI 10.0 — Runnable Core (F1)

This is a tiny, dependency-free starter runtime, isolated from the marketplace, Supabase and Vercel. It is **not yet an autonomous AI or connected model**.

## Requirements
- Node.js 22+

## Run locally
```sh
cd river-ai
cp .env.example .env
# Optional: load .env variables with your shell or configure them manually.
npm test
npm start
```

The server binds to localhost (127.0.0.1) by default:
- `GET /health` — health check
- `GET /status` — configuration and safe capability status

No model, credentials, tools, database, external network access, or deployment is enabled in this scaffold. Unknown routes and non-GET methods are rejected.

## Next milestones
1. Add provider adapters with explicit configuration and secret handling.
2. Add inspectable opt-in memory.
3. Implement a tool allowlist, sandbox and approval workflow.
4. Evaluate safety, reliability, privacy and model quality before enabling actions.

Do not expose this local server publicly without authentication, TLS, rate limiting and security review.