# RC-62 — state-store privacy preflight

The RC-11 store now fails closed unless the final state directory is a real directory owned by the running user and has no group/world permission bits. Existing state snapshots are also required to be regular files owned by the process user and mode-private (no group/world access). New snapshots and locks continue to use mode 0600.

The API image initializes its named data-volume mount at `/data` owned by the non-root Node user and mode 0700. The transaction preflight refuses a final directory symlink, unsafe directory permissions, or an ownership mismatch; reads refuse unsafe snapshot file permissions/ownership.

This is a safety check, not automatic repair. An existing volume that fails the check must be stopped and reviewed, backed up, and permissions/ownership corrected manually before reuse. The code does not silently chmod/chown an existing state store.

Tests cover symlinked directories, world-accessible directory refusal, unsafe state-file permissions and private mode on new snapshots. GitHub CI is required to verify the increment; local checkout testing is unavailable in this run.

No services, live data, deployment, merge, credentials, provisioning or spending were used.
