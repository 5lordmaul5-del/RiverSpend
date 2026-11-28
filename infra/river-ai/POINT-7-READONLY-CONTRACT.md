# Point 7 — Read-only endpoint contract smoke test

This optional smoke test verifies a running owner-host RiverSSAI API using GET-only requests.

- Checks /health and /ready response contracts (200 or 503 are valid, depending on runtime readiness).
- Checks that /v1/agents rejects missing and invalid tokens (401; 429 is tolerated if rate-limited).
- Checks owner-token GET /v1/agents returns a role count.
- Does not enqueue tasks, write memories, call chat, modify files, databases, credentials, or deployment.

Run on the owner host:
```bash
RIVER_AI_BASE_URL=http://127.0.0.1:8787 RIVER_AI_ADMIN_TOKEN='<owner-token>' bash infra/river-ai/read-only-contract-smoke.sh
```
The token is used by the script but never printed. Avoid running from untrusted networks. This is a smoke check, not a security audit.
