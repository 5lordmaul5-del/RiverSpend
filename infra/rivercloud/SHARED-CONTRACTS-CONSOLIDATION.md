# Shared contract consolidation

Branch: `feat/rivercloud-unified-policy-2026-11-26`

Implemented in source:
- New `shared-contracts.mjs` defines canonical deployment request keys, actor roles, API error catalogs and actor context normalization.
- Queue now consumes the shared actor context validator.
- Engine consumes the canonical request-key list.
- Both API layers consume shared policy/capacity error catalogs.
- Unit tests authored in `tests/rivercloud/shared-contracts.test.mjs`.

Validation status: tests have not been executed. This change is source-level consolidation only. It does not unify authentication providers, grant execution permissions, wire approvals to a worker, or enable deployment execution. The proxy identity headers remain an integration trust boundary requiring validation.
