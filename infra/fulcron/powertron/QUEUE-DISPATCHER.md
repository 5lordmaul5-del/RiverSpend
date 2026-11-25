# Task Queue & Dispatcher — MVP

This layer adds an ephemeral in-memory queue and a dispatcher preview.
- Queue stores tasks only in process memory (restart loses them).
- Duplicate IDs are rejected; basic status transitions are validated.
- Dispatcher returns advisory assignments requiring human approval.
- No agent execution, shell, external network, secrets, financial activity or production changes.

Tests:
```bash
node --test infra/fulcron/powertron/*.test.mjs
```
Next: durable storage, stricter transition graph, audit records, permissions and integration tests.
