# RiverSSAI Point 3 — recovery readiness and owner handover

This point makes the owner-operated runtime recoverable by documenting the prerequisites, decision gates, and repeatable recovery sequence. It is a readiness runbook, not evidence of a real restore.

## Recovery materials (keep outside Git)
- Owner host inventory and OS/Docker Compose versions.
- The encrypted PostgreSQL backup and its SHA-256 and HMAC sidecars, stored on a second physical/off-host location.
- Backup passphrase stored separately from backup files, preferably in a password manager and a sealed offline recovery copy.
- Runtime `infra/river-ai/.env`: preserve securely only if needed to resume the existing runtime; never upload it or put it in Git.
- Model name/version and approximate storage requirements.
- Owner contact and recovery date log.

## Recovery sequence
1. Confirm the host is isolated and disk space is adequate; do not expose API publicly.
2. Obtain backup, both sidecars and passphrase from independent locations.
3. Run `bash infra/river-ai/verify-encrypted-backup.sh <backup-file.dump.enc>` first.
4. Provision Docker Engine and Compose on a clean owner-controlled host; verify versions and basic health.
5. Follow Point 1 bootstrap only for a fresh runtime. Do not run it over an existing runtime or overwrite its environment.
6. For an existing runtime recovery, follow Point 2 restore drill. It creates a disposable database; it is not a production cutover.
7. Review the table count and logs, and manually compare expected application state using non-sensitive test data.
8. A real recovery acceptance requires a human owner to confirm the recovered database, application behavior, backup timestamp and data-loss window.
9. Keep the original host/data untouched until acceptance and a separately approved cutover plan.

## Failure / stop conditions
- Missing or mismatched checksum/HMAC, missing passphrase, empty dump, insufficient storage, or ambiguous database target: STOP.
- Never overwrite a live database, delete volumes, remove the old host, change DNS, expose ports, or perform cutover as part of this procedure.
- If restore fails, preserve the encrypted backup and diagnostic logs; do not attempt destructive cleanup outside the disposable drill database.

## Backup policy to decide before operational use
- Frequency and maximum acceptable data-loss window (RPO).
- Retention duration and number of generations.
- Two independent storage locations, at least one offline or access-restricted.
- Periodic restore drills (frequency and owner).
- Passphrase recovery and responsible owner.
- Documented recovery time target (RTO).

## Acceptance checklist
- [ ] Backup exists off-host and is readable as a file.
- [ ] SHA-256 and HMAC verified with correct passphrase.
- [ ] Restore drill completed on a disposable database.
- [ ] Schema/data sanity checks documented.
- [ ] Recovery materials inventoried without exposing secrets.
- [ ] Owner-approved RPO/RTO/retention policy.
- [ ] No live cutover without separate explicit approval.

## Current status
Point 3 documents the recovery readiness process. No host is provisioned, no real backup was accessed, no live restore or cutover occurred, and no credentials or real data were touched.
