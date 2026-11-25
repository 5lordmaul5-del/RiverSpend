# Fulcron implementation roadmap

## Priority order — avoid parallel complexity
1. **Foundation audit:** review PR #75 RiverCloud and PR #76 RiverSSAI 20.0; ensure mergeability and tests, fix issues in isolated branches.
2. **PowerTron task coordinator:** task queue, agent role registry, bounded task execution, status/result format; initially no shell or external network.
3. **RiverDB:** durable task state, memory metadata, audit trail; define backups and restore verification.
4. **RiverBuild:** isolated build/test jobs, resource ceilings, clean workspaces, artifact checksums and no deploy permission.
5. **River Recovery:** documented backups, restore drills and failure modes.
6. **RiverFortress:** dashboard for systems health, queue, incidents, approvals and logs.
7. **RiverCloud staging:** sandbox worker, HTTPS routing, auth, rate limits, monitoring, security scans and staging rehearsal.
8. **Integration:** connect one RiverSpend module at a time via documented APIs and staged tests.

## Definition of done for a stage
- Tests pass and their output is recorded.
- Permissions and resource limits are documented.
- Failures, rollback and recovery paths are exercised.
- No secrets in repository or logs.
- Human approval remains required for production, money, destructive or externally visible actions.
- Stage remains isolated until reviewed.

## Cost and autonomy
Use local open models and self-hosted components where feasible. Optional external services must be adapters that can be disabled. A local system still needs hardware, electricity, storage, maintenance and connectivity where applicable; estimates should be made before purchasing or provisioning anything.
