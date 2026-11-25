# RiverCloud Core — RC-1/RC-18 scaffold

Independent hosting foundation, kept separate from production.

## Current scope
- Docker Compose and Caddy proxy/TLS scaffold
- Static Fortress panel preview (disconnected)
- Policy validator, plan digest and loopback-only plan queue
- Runner boundary and fixed worker profile specification
- RC-7 execution envelope (execution disabled)
- RC-8 local hash-linked audit ledger prototype and approval/rollback design\n- RC-9 bounded job lifecycle and audit-event integration prototype\n- RC-10 approval-bound token prototype (fixed staging profile, commit and digest binding, expiry, one-use marking)
- RC-11 hardened single-file transaction/lock prototype: validation, file sync, atomic replace and cleanup\n- RC-12 stale-lock recovery and event hash-chain prototype (isolated helper module; not runtime verified)\n- RC-13 identity claim validation and role policy prototype (deny-by-default signature verification callback; not runtime verified)\n- RC-14 external audit sink contract prototype: event envelope, redaction, digest and signed HTTPS delivery descriptor (no network connection)\n- RC-15 staging isolation plan and fixed worker profile validator prototype (no worker execution)\n- RC-16 security/test/backup readiness framework (not run)\n- RC-17 staging rehearsal procedure (not performed)\n- RC-18 migration readiness and rollback checklist (not authorized or executed)

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

## RC-11 hardening notes
- Added validation for job and approval input and malformed state.
- Added file sync, atomic rename, best-effort directory sync, temp cleanup and lock metadata.
- Stale locks are not auto-recovered yet; target filesystem/crash testing remains required.

## RC-12 notes\n- Added stale lock recovery helper with PID liveness and quarantine rename, plus hash-chain event helper. Tests authored but not runtime-verified.\n- PID-based recovery has race/PID-reuse/platform limitations and is not a distributed lock. The chain is not an independent protected audit sink.\n\n## Next\nRC-16 through RC-18 framework is authored. Review, target-environment validation and approvals remain outstanding; no deployment or migration has occurred.
