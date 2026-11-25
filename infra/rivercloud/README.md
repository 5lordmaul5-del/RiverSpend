# RiverCloud Core — isolated prototype

Independent hosting foundation, kept separate from RiverSpend production.

## Current scope

- Docker Compose and Caddy proxy/TLS scaffold
- Static Fortress panel preview (disconnected)
- Policy validator, plan digest and loopback-only queue
- Transactional local state prototype and idempotent queue insert
- HMAC-bound approval prototype with random nonce and atomic one-use consumption
- Fixed worker-profile validator and staging-path validation
- Runner boundary and execution envelope; execution remains disabled
- Local hash-linked audit ledger, lifecycle and readiness prototypes
- Identity claim validator and role policy; no authentication provider integration
- External audit-sink contract; no outbound delivery
- RC-17 same-file lifecycle/audit transaction path (isolated migration API; not yet wired into existing callers)
- RC-18 bounded HTTP request, header and socket timeouts
- RC-19 local data backup/restore scripts with checksum, explicit restore confirmation and temporary-directory tests
- Backup/restore and migration checklists only

## Safety and status

No VPS, staging host, deployment worker, external audit sink, backup/restore drill on production data or migration has been provisioned or performed. The code is not production-ready. No merge or deployment is authorized.
