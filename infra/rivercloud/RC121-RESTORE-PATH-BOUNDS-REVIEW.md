# RC-121 — Restore archive path-depth review

Status: scoped hardening review; no production changes.

## RC-120 baseline
- Restore configuration now validates both entry-count and byte limits as positive integers.
- Invalid values fail cleanly with exit code 2 and no traceback.
- CI is the acceptance gate.

## RC-121 review target
The restricted restore validates archive paths, duplicate normalized names, file/child conflicts, and entry types. A further defense-in-depth step is to bound path depth and individual component/path lengths before extraction. This limits pathological archive metadata and reduces filesystem-dependent failures.

## Proposed acceptance tests
1. Reject entries exceeding a defined maximum component count.
2. Reject path names exceeding a defined total length bound.
3. Confirm rejection happens during archive preflight, before the restore target is created.
4. Confirm ordinary nested files still restore successfully.
5. Run the full isolated RiverCloud test workflow and inspect its result.

## Safety boundary
Work remains on `feat/rivercloud-core-2026-11-25` and PR #75. No merge, production deployment, production data, credentials, or live services are touched.
