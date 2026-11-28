# RC-102 — Storage and transaction review checklist
Date: 2026-11-26
Branch: feat/rivercloud-core-2026-11-25

## Existing safeguards observed in RC-11
- Single-file transactional mutation guarded by exclusive lock.
- Private directory/file permission checks and owner checks where supported.
- Symlink rejection and non-following file open flags.
- Bounded read and state file size (8 MiB) plus collection capacity checks.
- Writes via exclusive temporary file, sync, rename and directory sync.
- Lock timeout and ownership-aware lock removal.

## Verification items for next storage pass
1. Confirm platform assumptions for O_NOFOLLOW/O_NONBLOCK, directory fsync and permissions; fail safely where unavailable.
2. Exercise lock acquisition contention, timeout, owner cleanup and crash scenarios with deterministic tests.
3. Verify commit durability-uncertain semantics after rename but before directory sync; ensure callers never blindly retry non-idempotent mutations.
4. Test malformed/truncated JSON, oversized files, invalid schemas, symlinks, non-regular files, owner mismatch and unsafe directory permissions.
5. Test state extension arrays and all capacity limits at boundary and boundary-plus-one.
6. Review consistency across jobs, lifecycle records, approvals, event/audit ledger, backup and restore.
7. Test recovery using disposable fixtures and temporary directories only.

## Status
Checklist/assessment only. No live data or production storage was touched.
