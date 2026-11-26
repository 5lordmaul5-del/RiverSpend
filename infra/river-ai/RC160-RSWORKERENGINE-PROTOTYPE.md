# RC-160 — RSWorkerEngine prototype

Bounded in-process execution prototype using Python standard library.

Includes explicit task allowlist (echo, JSON validation, metrics validation), capability matching, bounded queue, active capacity, payload size limit, queued cancellation, and tests.

**Limitations:** not a production sandbox. Timeout is checked after handler returns and cannot interrupt a hung handler. No persistence, authentication, isolation, distributed coordination, shell/command execution, network access, provider integration or deployment. Worker IDs are labels, not credentials. Next: supervised sandbox process boundary, true hard timeout, policy approvals, ledger integration, CI tests.

Run: `python -m unittest -v` from this directory.
