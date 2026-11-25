# RiverCloud Core — RC-1/RC-4 scaffold

Independent hosting foundation, kept separate from production.

## Current scope
- Docker Compose orchestration
- Caddy proxy with automatic TLS for a configured domain
- Demo container routed through Caddy
- Bootstrap script and install notes\n- RiverCloud Fortress static panel scaffold (disconnected; controls disabled)\n- Policy-only deployment engine prototype (validation; no runner or deploy)\n- RC-3/RC-4 security contract and implementation plan

## Start on a Linux VPS
1. Point the domain's DNS A/AAAA records at the server.
2. Copy this folder to the VPS.
3. Copy `.env.example` to `.env` and set `RIVERCLOUD_DOMAIN` to the domain.
4. Run `sudo ./bootstrap.sh`.
5. Allow inbound TCP 80/443; secure SSH separately.

Once DNS propagates and ports are reachable, Caddy requests TLS certificates and routes traffic to the demo container.

## Important
- This scaffold does not provision a VPS, migrate RiverSpend, or provide a connected control plane. Panel is a static preview.
- Do not put secrets in Git.
- Never expose a Docker socket or arbitrary command endpoint to the internet.
- Configure firewall, SSH keys, OS updates, backups and monitoring.
- Review before production use.

## Roadmap
1. Core bootstrap and proxy scaffold
2. Domain routing and HTTPS (Caddy)
3. Secure deployment pipeline: allowlisted projects/branches, webhook verification, isolated builds, audit logs, health checks, rollback
4. RiverCloud Panel: authenticated status/logs/deploy/rollback UI
5. Backups, monitoring and capacity controls
6. Staging migration and cutover readiness
