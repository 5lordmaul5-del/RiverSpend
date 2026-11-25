# RC-11 transactional state prototype — hardening update

The state store serializes mutations with a lock file, validates the state envelope, writes a unique temporary file, synchronizes it, atomically renames it, attempts a directory sync, and cleans temporary files on failure. Queue submissions now use this transaction rather than independent read/write operations.

The queue fails closed when the lock cannot be acquired within its bounded timeout. Duplicate plan digests are checked and inserted in the same transaction, and queue state/events are persisted together.

## Limits

- Stale lock recovery is not automatic. A crash may leave a lock that requires careful manual review; do not blindly delete it.
- PID/lock behavior, crash durability, and directory sync need target-platform tests.
- JSON storage is local prototype storage, not a distributed or scalable database.
- Identity authentication, runner execution and deployment remain disabled.
\n\n### RC-28 directory-sync durability warning\n\nThe RC-11 store no longer silently ignores directory-sync failures after the atomic rename. It throws `state_commit_durability_uncertain` with `commitApplied=true` and a cause; the snapshot may already be committed. Callers must read/reconcile state before retrying rather than blindly resubmitting. A deterministic injected failure test exercises this post-rename condition and lock release. This is a fault-injection test, not a proof of target-filesystem crash durability.\n

### RC-28 CI evidence

- Runs **#257/#258 — SUCCESS: 123/123 Node tests**, plus bootstrap, backup/restore and Python syntax, Compose and Caddy validation. The corrected commit verified the directory-sync uncertainty handling and deterministic fault-injection test.
