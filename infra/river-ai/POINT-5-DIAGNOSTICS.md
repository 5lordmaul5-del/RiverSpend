# RiverSSAI Point 5 — safe operational diagnostics

Run from repository root on the owner host:

```bash
bash infra/river-ai/diagnose-owner-host.sh
```

The script reports prerequisites, environment-file presence and mode, Docker Compose service state, disk usage, and HTTP status only for localhost health/readiness endpoints. It does not print environment values, bearer tokens, logs, model prompts, database rows, or backup contents.

## Interpretation
- Docker Compose errors or unhealthy services require manual inspection on the owner host.
- A status of 000/no-response is a connectivity timeout/failure, not proof of data loss.
- Environment-file permissions should be 0600 (or 0400).
- Diagnostics are observational only; they do not restart, repair, delete, migrate, rotate, or modify services/data.

## Limitations
The script assumes Docker Compose and GNU `stat` on Linux. It does not inspect firewall rules, validate credentials, certify security, or perform recovery.
