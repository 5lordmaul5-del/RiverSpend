# RiverCloud private API (local core)

## Runtime boundaries

- This API is intended to run on a private/internal network; do not expose the database or this service directly to the public internet without an explicit gateway, TLS, and deployment review.
- Bearer authentication is delegated to RiverAuth. A request must not rely on client-supplied identity fields.
- Database calls run through `psql` with a minimal child-process environment, a statement timeout, an API-side timeout, bounded output, and a concurrency gate.
- The gate is process-local (8 active database subprocesses by default). It is not a distributed limit across replicas.
- Database failures, subprocess failures, timeout, saturation, and oversized subprocess output are surfaced as temporary service failures (503); sensitive database stderr is drained but not retained or returned to clients.
- Requests are rate-limited by remote-address key (60 requests per minute). This is an in-process limiter, not a distributed edge/WAF policy.
- Profile writes are restricted to the authenticated subject and validated display name. The database policy is expected to enforce the same identity boundary.

## Operational checklist

1. Supply `RIVERAUTH_ISSUER_URL`, `RIVERAUTH_PUBLISHABLE_KEY`, and `RIVER_CLOUD_API_DB_PASSWORD` via the runtime secret manager.
2. Keep `rivercloud-db` reachable only on the private network and use a least-privileged `rivercloud_api` database role.
3. Set platform/container CPU, memory, process, and network limits; application-level caps do not replace host limits.
4. Configure an external health monitor for `/health`, plus alerting on 503s, process restarts, and resource pressure.
5. Before deployment, review TLS termination, network exposure, database grants/RLS, secret rotation, backup/restore, and multi-replica rate/concurrency behavior.
6. Run the repository's RiverCloud validation workflow and integration tests. CI results must be verified before treating this as release-ready.

## Limits in this implementation

The concurrency gate and rate limiter are in-memory and reset on process restart. They do not coordinate between multiple instances. The API currently provides a small profile surface (`GET/PUT /v1/me`) and is not yet a complete RiverCloud service.
