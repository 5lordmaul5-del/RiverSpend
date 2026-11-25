# RiverCloud Core — RC-1/RC-11 scaffold

Independent hosting foundation, kept separate from production.

## Current scope
- Docker Compose and Caddy proxy/TLS scaffold
- Static Fortress panel preview (disconnected)
- Policy validator, plan digest and loopback-only plan queue
- Runner boundary and fixed worker profile specification
- RC-7 execution envelope (execution disabled)
- RC-8 local hash-linked audit ledger prototype and approval/rollback design\n- RC-9 bounded job lifecycle and audit-event integration prototype\n- RC-10 approval-bound token prototype (fixed staging profile, commit and digest binding, expiry, one-use marking)
- RC-11 single-file transaction/lock prototype for queue, lifecycle and approval-use state

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
RC-12: authenticated approver identity, crash-durability/stale-lock recovery, external protected audit sink and security review before any execution.
