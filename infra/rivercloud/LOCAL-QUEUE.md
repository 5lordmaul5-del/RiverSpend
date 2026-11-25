# RC-3 local queue prototype

This is a local-only HTTP API for validated deployment-plan records, not a build runner.

## Start
```sh
RIVERCLOUD_ENGINE_TOKEN="$(openssl rand -hex 32)" RIVERCLOUD_ENGINE_PORT=8787 node infra/rivercloud/server.mjs
```
Use a token of at least 32 characters. It binds only to loopback (127.0.0.1) and rejects other bind addresses.

## Routes (Bearer token required)
- GET /health — status (queue prototype)
- GET /jobs — persisted job-plan list
- POST /deploy — validated staging plan; JSON fields projectId, branch, commit (40-character SHA), target.

## Important limits
- The prototype accepts only the configured project/branch/target policy.
- Data stored locally in queue-data/jobs.json; protect and back up this directory.
- No job worker, build, container, webhook, proxy or deployment is connected.
- Do not expose this API to the internet or use it for production.
- No operational security certification.
