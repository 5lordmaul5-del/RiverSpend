# RiverFortress launch checklist

## Account and repository
- [ ] MFA/passkeys enabled for owner and admins
- [ ] Recovery methods stored securely offline
- [ ] Separate daily and administrative accounts
- [ ] Least privilege; review tokens and revoke unused
- [ ] Protected main branch and required review/checks
- [ ] Secret scanning and dependency alerts enabled
- [ ] No secrets committed; rotate exposed secrets

## Infrastructure
- [ ] Inventory and threat model documented
- [ ] TLS enabled and renewal tested
- [ ] Firewall defaults deny; only required ports exposed
- [ ] Admin access restricted; SSH keys and hardened configuration
- [ ] Updates and vulnerability patch process
- [ ] Central monitoring and alerting
- [ ] Provider-independent recovery instructions

## Backup and recovery
- [ ] Encrypted independent backup
- [ ] Immutable/offline copy where feasible
- [ ] Restore test completed and documented
- [ ] RTO/RPO defined and realistic
- [ ] Emergency contacts and incident runbook available offline

## Before production
- [ ] Staging deployment tested
- [ ] Security review completed
- [ ] Failover tested with controlled rollback
- [ ] Legal/privacy obligations reviewed
