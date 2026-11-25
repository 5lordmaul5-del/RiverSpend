# RC-21 — state-lock release ownership

The RC-11 state transaction now records the opened lock descriptor's device/inode identity and removes the lock path only when a fresh `lstat` shows the same regular-file inode. If the lock pathname has been replaced, cleanup preserves the replacement rather than unlinking another object's lock path. The descriptor remains open until after this ownership check/unlink.

This protects the cleanup path against a pathname-replacement race; it does **not** prevent a hostile process with write access to the state directory from unlinking the lock while a transaction is active. The directory must remain private to the service account, and the file store is still a single-host prototype.

Regression test: during a transaction, replace the lock pathname with a symlink; a nested transaction must time out and the cleanup must leave the replacement symlink intact.

Reproducible command: `node --test infra/rivercloud/rc11-state.test.mjs`.
