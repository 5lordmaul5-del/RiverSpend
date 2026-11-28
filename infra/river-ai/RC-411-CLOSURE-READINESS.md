# RC-411 — RiverSSAI closure readiness and convergence checklist

This checklist is an evidence-based closure plan, not a claim that the system is production-ready.

## Integration/CI evidence presently recorded
- [x] RC-407 consolidated regression workflow reports success.
- [x] RC-408 preflight workflow reports success.
- [ ] Independently confirm suite coverage and branch ancestry; workflow success is not equivalent to operational acceptance.
- [ ] RC-406 HMAC constant-time and malformed-sidecar rejection CI evidence.
- [ ] Confirm recovery/fencing suite CI evidence on the exact candidate commit.

## Convergence work — reduce branch fragmentation
- [ ] Map each PR to a single dependency graph and identify duplicate/overlapping changes.
- [ ] Select a candidate integration branch only after inspecting exact diffs and ancestry.
- [ ] Reconcile conflicts with review and tests; avoid blind merge/cherry-pick.
- [ ] Re-run the consolidated gate on the candidate commit after reconciliation.

## Minimum release-candidate evidence
- [ ] Authenticated request contract and authorization policy.
- [ ] Payload bounds, idempotency and ledger durability.
- [ ] Worker lease, fencing and stale-worker rejection.
- [ ] Bounded retries and visible terminal failure.
- [ ] Supervisor timeout, output bounds, process cleanup and resource limits.
- [ ] Independent OS/container/network isolation evidence.
- [ ] Backup integrity, restore drill and recovery-key procedure.
- [ ] Secret redaction and rotation.
- [ ] Observability, operational runbook and incident response.
- [ ] No deployment, live data, external spending or production exposure without explicit authorization.

## Closure rule
A candidate is called locally integration-tested only when the exact candidate commit passes the required CI gate. It is called operationally accepted only after the controlled environment and isolation/recovery items above have evidence. Production-ready status requires a separate authorized release decision.
