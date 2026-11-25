# Task Queue & Dispatcher
The queue uses a durable local JSON snapshot and append-only JSONL audit log.
- Snapshot replacement uses atomic rename.
- Duplicate task IDs are rejected.
- Status transitions are validated and audited.
- **Single process only:** concurrent process coordination is not implemented.
- Dispatcher is advisory. No agent execution or deployment.

Instantiate `new TaskQueue('/absolute/path/to/private/storage')`. Keep storage outside the repository and restrict host access.

Tests: `node --test infra/fulcron/powertron/*.test.mjs`

Before multi-user production: transactional storage/locking, authentication, authorization, backup/restore, audit integrity and worker isolation.
