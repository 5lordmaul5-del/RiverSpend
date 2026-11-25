# RC-17 — full staging rehearsal procedure

Rehearsal is a scripted plan only; it must be run on a provisioned, isolated staging system and never on production.

## Preconditions
- RC-16 gates reviewed; staging isolated from production credentials, data, volumes and network.
- Approved commit SHA; staged artifacts hashed; identity and approver recorded.
- Backup/restore procedure available; monitoring and audit sink checked.

## Sequence
1. Record rehearsal ID, operators, commit SHA, artifact digest and approvals.
2. Verify isolation, firewall, resource quotas and secrets separation.
3. Build from pinned source; capture logs and artifact hashes.
4. Deploy only to staging using reviewed procedure.
5. Run smoke, functional, security-boundary, monitoring and log tests.
6. Simulate failed health check and confirm staged release is not promoted.
7. Exercise rollback in staging and verify application/data state.
8. Test backup restore into isolated environment; record RPO/RTO.
9. Review audit records, sanitize logs and document deviations.
10. Stop services, remove ephemeral secrets/workspaces, preserve approved evidence.

## Acceptance
All steps have evidence, no critical/high unresolved findings, rollback and restore verified, and an independent reviewer signs off. This does not authorize production migration.
