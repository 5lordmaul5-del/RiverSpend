# RiverCloud prepared-run audit projection (RC-148)

The audit projection is a read-only representation of a prepared run that first passes the runner's envelope verification. It records the run identity, plan and envelope digests, timestamp, target, and non-executed status, then computes a separate SHA-256 projection digest.

This is an integrity aid, not an authenticated audit log: it does not prove authorship, provide tamper-resistant storage, authorize execution, or replace external append-only logging. The runner remains disabled. No shell, Docker, deployment, network, approval, or production capability is added by this module.

Use `projectPreparedRunAudit(run)` only for verified prepared envelopes. `verifyAuditProjection(record)` validates its shape and digest.
