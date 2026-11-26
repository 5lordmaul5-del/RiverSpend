# RC-158 — Diagnostic Gateway
- Allowlisted routes: observatory and diagnostic-report only.
- Each route returns the shared RC-156 envelope via RC-157 adapters.
- Unsupported routes fail closed with bounded error contracts.
- Read-only: no execution, deployment, credentials, external I/O or mutation.
- Tests authored; not run or CI-verified in this environment.
