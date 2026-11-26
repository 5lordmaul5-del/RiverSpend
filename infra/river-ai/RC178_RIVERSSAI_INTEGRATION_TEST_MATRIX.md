# RC-178 — RiverSSAI Integration Test Matrix

**Status:** proposed test specification; not executed.  
**Purpose:** convert integration milestones into testable acceptance criteria without implying components are already connected.

## Test groups and required outcomes

| ID | Scenario | Expected result |
|---|---|---|
| INT-001 | Valid task envelope | Accepted only after schema validation |
| INT-002 | Unknown task type | Rejected; no dispatch |
| INT-003 | Oversized payload | Rejected at boundary |
| INT-004 | Missing approval for high-risk task | Denied |
| INT-005 | Invalid approval binding | Denied |
| INT-006 | Expired/revoked API key | Denied |
| INT-007 | Key with insufficient scope | Denied |
| INT-008 | Store/ledger unavailable | Fail closed; bounded generic error |
| INT-009 | Duplicate idempotency key | No duplicate side effect |
| INT-010 | Queue capacity reached | No unbounded growth |
| INT-011 | Lease expiry | Work becomes recoverable according to policy |
| INT-012 | Stale worker completion | Rejected |
| INT-013 | Retry count exceeded | Terminal failure or quarantined status |
| INT-014 | Cancellation | State transition enforced; no new dispatch |
| INT-015 | Audit record | Required transition recorded; secrets excluded |
| INT-016 | Restart/recovery | Durable state reconciled; no unsafe duplicate execution |
| INT-017 | Backup manifest mismatch | Restore validation blocked |
| INT-018 | Restore drill | Evidence and recovery time documented |
| INT-019 | Worker timeout | Process-level timeout verified where supported |
| INT-020 | Worker isolation | Isolation boundary independently reviewed; do not assume harness is a sandbox |

## Execution record template
For each case, record commit SHA, environment, test command, timestamp, result, logs/artifact reference, owner/reviewer and unresolved limitations. Never label an authored test as passed.

## Release gates
1. All relevant unit and integration tests actually executed.
2. Security boundary and privilege model reviewed.
3. Failure and recovery cases exercised.
4. No secrets or private data in logs.
5. Rollback and migration strategy documented.
6. Explicit human approval before merging/deploying.

This matrix is a proposal, not proof of current test coverage or implementation.
