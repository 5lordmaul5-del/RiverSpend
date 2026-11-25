# RC-11 transactional state prototype — hardening update

The state store serializes mutations with a lock file, validates the state envelope, writes a unique temporary file, synchronizes it, atomically renames it, attempts a directory sync, and cleans temporary files on failure. Queue submissions now use this transaction rather than independent read/write operations.

The queue fails closed when the lock cannot be acquired within its bounded timeout. Duplicate plan digests are checked and inserted in the same transaction, and queue state/events are persisted together.

## Limits

- Stale lock recovery is not automatic. A crash may leave a lock that requires careful manual review; do not blindly delete it.
- PID/lock behavior, crash durability, and directory sync need target-platform tests.
- JSON storage is local prototype storage, not a distributed or scalable database.
- Identity authentication, runner execution and deployment remain disabled.
