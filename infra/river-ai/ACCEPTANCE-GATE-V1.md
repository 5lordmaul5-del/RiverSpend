# RiverSSAI V1 consolidated acceptance gate

Run from repository root after checking prerequisites and reading the data-safety notes:

```bash
chmod +x infra/river-ai/test-riverssai-v1.sh
./infra/river-ai/test-riverssai-v1.sh
```

The gate runs policy assertions, startup/model readiness, authenticated request/response, then full-stack restart and memory recovery.

## Preconditions and impact
- Docker Engine and Compose, curl, jq, Node.js.
- `infra/river-ai/.env` with valid DB password and 32+ character admin token.
- First run can download model weights, consuming disk/network and time.
- The recovery test writes a test memory marker and restarts Compose services.
- It does **not** deploy, merge, access live commerce data, pay, or delete volumes/data.
- Never run `docker compose down -v` as part of this gate.

## Result criteria
Pass only if the shell script exits 0 and displays `== ACCEPTANCE GATE PASSED ==`. This gate is authored but has not been executed on a real Docker host in this session.
