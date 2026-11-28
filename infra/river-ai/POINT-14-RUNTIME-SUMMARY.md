# Point 14 — Runtime status and endpoint summary

Owner-run read-only summary:
```bash
bash infra/river-ai/runtime-summary-owner.sh
```

Shows Compose service state and HTTP status codes for localhost health/readiness endpoints. Response bodies are suppressed. The script does not read logs, inspect database contents, expose credentials, change state or start/stop services. It expects the documented local endpoint port (3000); adjust only if the owner configuration's runtime port differs.
