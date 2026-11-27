# RC-193 Execution Supervisor

Local SQLite prototype for tracking execution lifecycle, heartbeats, deadlines and supervisor scan decisions. Expiration records an expired state; missing heartbeat is reported for operator/orchestrator action, not automatically killing the process.

**Limitations:** local single-host prototype. Heartbeat status is heuristic. No process termination, distributed coordination, auth, downstream fencing enforcement or integration with existing task/lease infrastructure. Tests authored, not CI-verified.
