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

## Task Engine (planning only)
A deterministic task planner creates a reviewable four-step plan, flags keywords associated with sensitive actions, and always sets execution disabled and approval required. It does not run commands, use tools, contact external services, deploy, or modify project state. This is planning groundwork, not agent autonomy.


## RiverGuard (policy foundation)
- Classifies requests into low/medium/high/invalid risk.
- Creates explicit pending approval records and supports approve/reject decisions.
- Approval records never enable execution; execution is not implemented.
- Classification is a conservative heuristic, not a security boundary. Production use requires identity, permission enforcement, audit storage, sandboxing, and independent tests.


## RiverKnowledge
A local file-based knowledge store for explicit user-provided notes. Entries require title/content, size limits, and are not automatically ingested from network sources or learned implicitly. This foundation is not yet integrated into the HTTP runtime or task engine.
