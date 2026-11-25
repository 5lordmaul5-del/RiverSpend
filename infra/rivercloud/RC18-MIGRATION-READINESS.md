# RC-18 — migration readiness and rollback plan

## Final readiness checklist
- [ ] RC-16 gate evidence reviewed and complete
- [ ] RC-17 staging rehearsal completed and signed off
- [ ] Target server, costs, ownership and access model approved
- [ ] DNS, firewall, TLS, monitoring and incident plan reviewed
- [ ] Backups verified and restore tested; RPO/RTO accepted
- [ ] Data migration inventory, mapping, validation and cutover plan reviewed
- [ ] User impact, maintenance window and communication plan agreed
- [ ] Rollback triggers, decision owner and time limit defined
- [ ] Secrets and privileged access audited; MFA enforced
- [ ] Independent technical review and explicit user authorization recorded

## Migration outline (not performed)
1. Freeze and identify source version; verify backup.
2. Provision and secure target infrastructure.
3. Validate isolated staging deployment and restore.
4. Perform migration rehearsal with data validation.
5. At an approved maintenance window, execute migration plan and smoke tests.
6. If trigger conditions occur, halt, preserve evidence and follow rollback plan.
7. Reconcile data carefully; rollback of app alone may not reverse database changes.
8. Resume only after explicit decision and sign-off.

## Rollback outline
- Trigger examples: failed health checks, critical errors, integrity mismatch, security incident or exceeded downtime window.
- Stop promotion and preserve logs.
- Restore prior application artifact and configuration; database rollback/reconciliation is a separate operation and must be preplanned and validated.
- Verify service, data integrity and monitoring; document outcome.

## Status and boundary
RC-18 produces readiness documents only. No server is provisioned, no migration or deployment occurred, and this milestone does not imply operational readiness or authorize a cutover. Final approval is separate.
