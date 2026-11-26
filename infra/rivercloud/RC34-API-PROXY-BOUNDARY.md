# RC-34 — proxy identity/API authorization prototype

**Status: isolated, not wired into Compose or production.**

This increment adds a testable API-side trust boundary for the future OAuth2 Proxy integration:

- Only a configured source address is trusted for identity headers. The standalone prototype defaults to loopback `127.0.0.1`; Compose explicitly overrides it to the proxy's API-network address `172.31.250.3`.
- Identity is taken only from `X-Forwarded-User` and `X-Forwarded-Groups`, after source-address validation. No client-supplied role header is accepted.
- Groups are mapped to the existing RC-13 role catalog. Unmapped groups fail closed.
- Route permissions are enforced for `GET /api/health`, `GET /api/jobs`, and `POST /api/plan`.
- The plan endpoint is queue-only and reports execution disabled. This module does not approve, build, deploy, or start the runner.
- Request size/time bounds and response security headers are applied.

## Test coverage added

- Direct caller rejected when its source is not the configured proxy.
- Viewer may read queue but cannot submit plans.
- Operator may submit an idempotent plan; no execution is enabled.
- Missing identity and unmapped groups fail closed.
- Wrong method, content type and oversized body are rejected.

## Integration blockers

The current Compose OAuth2 Proxy still routes to the demo upstream only. This module is **not yet connected to the proxy or a Compose service**. Before integration, the API must be an internal-only service with no published host port, the proxy must route `/api/` to it, the source address/network must be enforced, and a real OIDC provider login plus spoofing/revocation tests must be performed. Do not treat the test callback headers as real authentication.

No provider credentials, production data, staging host, runner, deployment, or external service are used by these tests.

## CI evidence

GitHub Actions run **45735325864 (#333)** passed **138/138 Node tests**, zero failures, plus shell/Python syntax, the restore directory-race test, Compose configuration and Caddy validation. This verifies commit `e2dbdbbca5556c215307c81ed23d3c005bdecd85`. The prototype is still not wired to the actual OAuth2 Proxy upstream or Compose service.


## RC-35 follow-up

The isolated Compose configuration now routes the `/api/` upstream to this module on a separate internal network, with the API service unexposed to host ports. This is configuration wiring only; no real OIDC login or container build has been tested. See [RC-35](RC35-API-OIDC-WIRING.md).


### RC-54 — local default peer alignment

The standalone API default was corrected from a stale public-network address to `127.0.0.1`, matching its loopback default bind for local testing. The Compose environment still explicitly uses `172.31.250.3` on the private API network. A regression test ensures a loopback request reaches identity validation (401 without identity), rather than being rejected as an untrusted network peer (403). This is local-default consistency only; it does not verify live OAuth2 Proxy header behavior.
