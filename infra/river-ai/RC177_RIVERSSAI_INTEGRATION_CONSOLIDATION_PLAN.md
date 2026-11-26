# RC-177 — RiverSSAI Integration Consolidation & Verification Plan

Date: 2026-11-26
Status: planning document; isolated draft PR; no merge/deployment.

## Purpose
Reduce fragmentation across RiverSSAI/RiverCloud/RiverAPI prototype PRs by establishing a dependency-aware consolidation and verification order. Avoid overlapping components until foundational work is tested and connected.

## Rules
- No merges or production deployments without explicit owner approval.
- Prefer isolated, small PRs and tests on each branch.
- Treat prototypes as unverified until CI and integration checks actually pass.
- Registry entries are not running agents; checklists are not completed reviews.
- Fail closed on missing credentials, policy, approvals, quotas, or dependencies.
- Keep secrets out of commits/logs; use least privilege.
- Require rollback notes and test evidence for integration milestones.

## Workstream sequence

### Stage A — Baseline inventory and CI evidence
Record default-branch commit, open PRs, branch bases, dependencies and CI state. Classify each PR (independent, stacked, documentation, prototype, overlap); distinguish authored tests from executed tests; check conflicts and base drift.

### Stage B — RiverAPI foundation
Review RC-143..146 PR #102 and store-backed adapter PR #110 (stacked on #102). Validate envelope constraints, scope/expiry/revocation, storage errors, idempotency and audit. No production execution or provider actions.

### Stage C — bounded commander/worker foundations
Suggested order: RC-158 (#116) runtime; RC-159 (#117) ledger; RC-160 (#118) worker prototype; RC-161 (#119) process supervision; RC-162 (#120) policy/budget/approval; RC-163 (#121) adapter; RC-164 (#122) contracts; RC-165 (#123) pipeline; RC-166 (#124) recovery helper.
Acceptance: interface contracts, transaction/idempotency, lease expiry/recovery, queue bounds, authorization boundaries, failure tests. No arbitrary execution without reviewed isolation.

### Stage D — RiverPython and RSEngineer
RC-167 (#125) allowlisted core; RC-168 (#126) registry; RC-169 (#127) manager; RC-170 (#128) intake; RC-171 (#129) pattern review; RC-172 (#130) readiness checklist; RC-173 (#131) review package; RC-174 (#132), RC-175 (#133), RC-176 (#134) catalogs/roadmap.
Acceptance: consolidate duplicated registry definitions; single versioned schema; validation tests; do not claim pattern-based review certifies security.

### Stage E — RiverCloud & continuity
Reconcile RC-149 (#106), RC-150 (#107), RC-151 (#108), RC-152 (#109), RC-153 (#111) and monitored local-core PR #49. Independently verify database recovery, backup integrity, portability and restore tests. Document dependencies, quotas, rollback and operator actions.

### Stage F — Integration and acceptance
Test task lifecycle; duplicate/idempotent requests; expiry, retry caps, cancellation and stale leases; policy denial and missing/invalid approval; storage failures; queue/budget bounds; audit integrity; recovery/restart; API key expiry/revocation/scope; restore/portability evidence.

## Dependency snapshot (recheck before action)
- #110 is stacked on #102.
- #121–#124 and #123 are integration prototypes, not yet claimed wired into earlier components.
- #116–#118 and #117 are separate draft components; tests may be authored but not executed.
- #125–#131 are separate prototypes.
- #132–#134 are organizational documentation.
- #49 is monitored by an existing scheduled task.

## Consolidation decision
Do not batch-merge the series. Choose a narrow milestone only after CI, diff review, dependency/base checks and integration tests establish a safe sequence. This document is a coordination plan, not verification evidence.
