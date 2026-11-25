# RiverCloud Core — RC-1/RC-5 scaffold

Independent hosting foundation, kept separate from production.

## Current scope
- Docker Compose orchestration and Caddy proxy/TLS scaffold
- Demo container and bootstrap/install notes
- RiverCloud Fortress static panel preview (disconnected)
- Policy validation and deployment-plan digest
- Loopback-only local queue API (plan records only; no execution)
- Runner boundary prototype: prepared run record, execution disabled
- Security requirements and roadmap documentation

## Start on a Linux VPS
1. Point DNS A/AAAA records at the server.
2. Copy this folder to a VPS.
3. Copy `.env.example` to `.env` and set `RIVERCLOUD_DOMAIN`.
4. Run `sudo ./bootstrap.sh`.
5. Allow inbound TCP 80/443; secure SSH separately.

The demo route is only a scaffold. It is not RiverSpend hosting.

## Safety
- No VPS has been provisioned and no production deployment or migration has occurred.
- Do not commit secrets.
- Never expose Docker socket or arbitrary command execution to the public internet.
- Configure firewall, SSH keys, OS updates, backups and monitoring.
- Review and test before production use.

## Next milestone
RC-6: isolated worker runtime, fixed build profiles, audit records, approvals, health-check and rollback design.
