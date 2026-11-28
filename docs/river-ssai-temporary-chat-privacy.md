# RiverSSAI temporary-chat privacy correction

This stacked draft corrects the temporary-chat prototype in PR #322.

## Verified source-level changes
- Client persistence is skipped while temporary mode is active.
- Entering and exiting temporary mode clears volatile messages; exiting does not overwrite the ordinary saved chat with an empty array.
- The request carries an explicit temporary-mode flag.
- The server applies a shared memory policy and skips both reads from and writes to `river_ai_memories` for temporary requests.
- Standard chat retains its existing memory behavior.

## Limitations
- Temporary mode is not anonymous and does not guarantee provider-side retention/deletion behavior.
- This does not audit all logs, analytics, caches, backups or external provider policies.
- A focused push-only GitHub Actions workflow checks the policy module, API syntax and source-level persistence/memory guards; it does not replace browser, end-to-end or server integration testing.
- No merge or deployment.
