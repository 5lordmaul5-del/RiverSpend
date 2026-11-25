# Security checklist

## Accounts and source control
- [ ] MFA/passkeys on owner/admin accounts
- [ ] Offline recovery methods
- [ ] Separate admin and daily-use identities
- [ ] Least privilege and token review
- [ ] Protected main branch and review/check gates
- [ ] Secret scanning and dependency alerts
- [ ] No secrets in source; rotate exposed credentials

## Hosting
- [ ] Asset and dependency inventory
- [ ] Firewall deny-by-default; only required ports exposed
- [ ] TLS and renewal test
- [ ] Restricted administration and hardened SSH
- [ ] Patch process
- [ ] Central logs and alerts

## Recovery
- [ ] Independent encrypted backup
- [ ] Immutable/offline copy where feasible
- [ ] Restore drill recorded
- [ ] RTO/RPO defined
- [ ] Offline runbook and emergency contacts

## Production gate
- [ ] Staging tested
- [ ] Security review
- [ ] Failover and rollback rehearsed
- [ ] Privacy/legal requirements reviewed
