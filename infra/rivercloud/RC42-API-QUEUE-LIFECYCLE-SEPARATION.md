# RC-42 — API queue/lifecycle data separation review (26 Nov 2026)

## Finding
Static inspection of `infra/rivercloud/rc34-proxy-api.mjs`, `queue.mjs`, and `rc17-atomic-lifecycle.mjs` reveals that the proxy-identity API prototype currently calls `listQueue(storeFile)` and `queuePlan(storeFile,...)`, while RC-17 lifecycle/audit operations are implemented separately through `transactState` and `lifecycleJobs`/audit records.

## Risk / boundary
These are distinct state pathways and must not be assumed to provide the same lifecycle, approval binding, or tamper-evident audit guarantees. API plans currently receive an actorRef and roles snapshot, but that does not itself demonstrate integration with RC-17 atomic approvals and audit verification. The API `/api/jobs` endpoint should not be represented as a verified lifecycle/audit view.

## Required next work
- Establish an explicit intended integration contract between proxy API queue plans and RC-17 lifecycle records.
- Keep queue plan creation non-executing; no runner activation.
- Tests should verify job creation, actor attribution, digest binding, approval/audit linkage, and integrity failures on the integrated pathway.
- Avoid merging separate state models or migrating state without a migration design and backup/restore rehearsal.
- Validate authorization for jobs listing and ensure least-privilege response fields.

## Scope and safety
Static source review only. No live service, deployment, merge, provider configuration, credential change, runner execution, infrastructure provisioning, or spending.
