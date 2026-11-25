# RiverFortress incident response runbook

## Severity and immediate actions
1. **Declare incident:** record time, affected systems, reporter and symptoms.
2. **Contain safely:** disable compromised credentials, isolate affected hosts/network segments, apply edge mitigations. Avoid destructive cleanup.
3. **Preserve evidence:** retain logs, snapshots and relevant records with access controls and timestamps; document actions.
4. **Assess scope:** identify affected systems, data, accounts, backups and dependencies.
5. **Recover cleanly:** rebuild from trusted images, rotate secrets, validate integrity, restore data from known-clean backups.
6. **Verify:** test application, access controls, monitoring and data consistency.
7. **Communicate:** coordinate internal updates, users, providers, counsel and authorities as legally required.
8. **Post-incident:** timeline, root cause, lessons, remediation owners and follow-up tests.

## Never
- Delete evidence or logs to hide an incident.
- Restore a backup without checking whether it is clean.
- Promote an unverified standby automatically.
- Reuse credentials believed compromised.
- bypass lawful restrictions or orders.

## Contacts and dependencies
Maintain an offline copy of provider support contacts, account recovery procedures, legal contacts, and owner assignments. Do not place passwords or recovery codes in this document.
