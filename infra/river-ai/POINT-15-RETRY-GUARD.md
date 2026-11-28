# Point 15 — Bounded retry and timeout guard

This optional wrapper is only used when explicitly invoked with a command. It limits attempts to 1–5, applies a timeout to each attempt, and uses a fixed delay. It does not retry indefinitely.

Example:
```bash
RIVERAI_RETRY_ATTEMPTS=3 RIVERAI_RETRY_TIMEOUT_SECONDS=20 bash infra/river-ai/retry-guard.sh curl --fail http://127.0.0.1:3000/health
```

Avoid wrapping non-idempotent actions (payments, writes, migrations, destructive actions) in retries. The wrapper cannot determine whether a command is idempotent. Review command semantics before use.
