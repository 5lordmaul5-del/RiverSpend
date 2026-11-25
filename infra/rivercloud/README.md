# RiverCloud Core — RC-1/RC-8 scaffold

Independent hosting foundation, kept separate from production.

## Current scope
- Docker Compose and Caddy proxy/TLS scaffold
- Static Fortress panel preview (disconnected)
- Policy validator, plan digest and loopback-only plan queue
- Runner boundary and fixed worker profile specification
- RC-7 execution envelope (execution disabled)
- RC-8 local hash-linked audit ledger prototype and approval/rollback design

## Setup scaffold
1. Point DNS A/AAAA records at a VPS.
2. Copy this folder to the server.
3. Copy `.env.example` to `.env` and configure the domain.
4. Run bootstrap only on a reviewed, properly secured Linux host.
5. Configure firewall, SSH, backups, monitoring and TLS.

The demo route is not RiverSpend hosting.

## Safety and status
- No VPS provisioned, no deployment/migration, and no worker execution.
- Approval, webhook, external audit sink, build, health-check integration and rollback are designs, not implemented.
- Do not commit secrets or expose a Docker socket/public arbitrary-command endpoint.
- Prototype tests have not been run in the target environment.

## Next
RC-9: review and testing, safe integration of audit records into queue lifecycle, approval-bound job lifecycle, and isolated execution readiness checks.
