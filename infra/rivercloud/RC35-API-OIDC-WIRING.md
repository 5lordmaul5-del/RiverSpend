# RC-35 — OAuth2 Proxy to API Compose wiring (isolated prototype)

**Status: configuration and static regression tests added; real provider login and container build are not verified.**

This increment wires the previously separate RC-34 API prototype into the Compose topology without starting any service.

## Network boundary

- Caddy is the only service publishing host ports and resides on `rivercloud-public`.
- OAuth2 Proxy is the only service connected to both networks. It is on the public network for Caddy and on `rivercloud-api` for the API/demo upstreams.
- `rivercloud-api` and the demo upstream are on the Docker `internal: true` network `rivercloud-api`. Caddy is not attached to that network.
- The API has no published host port. It binds to container interfaces, but accepts forwarded identity only from the proxy's fixed backend-network address `172.31.250.3`.
- Queue state is mounted into a named volume. API root filesystem is read-only, the process runs as the Node non-root user, all Linux capabilities are dropped, no-new-privileges is enabled, and CPU/memory bounds are declared.

## Path routing and identity headers

OAuth2 Proxy is configured with multiple upstreams:

- `/api/` → `rivercloud-api:8788`
- fallback `/` → demo upstream

The proxy's `pass_user_headers` and `set_xauthrequest` settings are enabled, and the example allowlist now includes the five RC-13 role groups. The API still performs its source-address check and maps forwarded group names to its fixed role catalog. The group allowlist must match actual provider group names; these example names are placeholders for configuration, not real credentials or identity records.

OAuth2 Proxy path-based upstream matching and multi-upstream support are documented at https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/#upstreams-configuration. Static tests only verify that the expected path/network/header configuration is present; they do not prove runtime header behavior, path rewrite behavior, CSRF/session behavior, or spoofing resistance.

## Container build

Added a small Dockerfile with explicit COPY entries for the API and its direct code dependencies only (not the repository or `.env` files). The base image is Node 22.23.5 Alpine 3.23, pinned to an immutable digest sourced from Docker Hub's official Node image page. This Dockerfile has not yet been built in CI; the Compose config check does not build or start services.

## Test scope and blockers

- Added static regressions for the Compose API service, non-root/read-only controls, internal network separation, proxy path routing, role-group allowlist, and Dockerfile digest/explicit-copy behavior.
- The existing Node test workflow includes these tests and validates Compose configuration; a fresh CI result is required before claiming the increment verified.
- No real OIDC issuer, credentials, MFA, browser login, session revocation, live proxy/API request, runner, staging host, deployment, backup/restore or paid operation is used.
- Before production eligibility: build the API image in a controlled CI job, test real provider login in disposable staging, test header spoofing and group claim mapping, verify proxy/API source-IP enforcement and path mapping, and test session revocation/CSRF/rate-limits.

No merge, deployment, server provisioning or spending is authorized by this increment.


## CI closeout

GitHub Actions run **45743142427 (#337)** passed **145/145 Node tests** and all validation steps (bootstrap shell, backup/restore/Python syntax, the 1/1 restore race test, Compose config and Caddy validation). This verifies commit `cb91b7f9db268c9ef53c255903b6f51a7a84d3a5`. The API image was not built and no service was started.
