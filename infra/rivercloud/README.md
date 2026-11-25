# RiverCloud Core — bootstrap scaffold

This is the first, intentionally small foundation for RiverSpend's independent hosting platform.

## Current scope
- Docker Compose orchestration
- Caddy proxy container and persistent TLS/config volumes
- Bootstrap script to install Docker (Linux VPS) and launch the scaffold
- A placeholder HTTP response, **not yet a deployment/control panel**

## Install on a fresh Ubuntu/Debian VPS
1. Point your domain's DNS A (and optionally AAAA) record at the VPS.
2. Copy this folder to the VPS.
3. `cp .env.example .env` and set `RIVERCLOUD_DOMAIN`.
4. Run `sudo ./bootstrap.sh`.
5. This initial scaffold only serves the placeholder on port 80; HTTPS and app routing are the next milestone. Do not expose admin interfaces.

## Safety notes
- Do not put secrets in Git.
- Restrict SSH and firewall to required ports.
- Use SSH keys, updates, backups, and monitoring.
- This scaffold does not migrate RiverSpend or replace Vercel yet.
- Never use this bootstrap on a production server without reviewing it.

## Roadmap
1. Core bootstrap and proxy (this scaffold)
2. HTTPS domain configuration and app routing
3. Secure deployment agent/API (authentication, allow-listed projects, audit logs)
4. RiverCloud Panel: status, logs, deploy, rollback
5. Backups, monitoring, capacity management, multi-node expansion
