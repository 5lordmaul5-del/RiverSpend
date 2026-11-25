# RC-30 — queue and store capacity bounds

The local queue is bounded to 5,000 job entries and 10,000 events. Duplicate submissions are checked before the capacity guard so idempotent retries remain successful at the limit. RC-11 now rejects state snapshots above 8 MiB using a bounded descriptor read and also refuses to write a serialized snapshot larger than the limit. Capacity and oversized-state errors map to HTTP 503.

No automatic pruning or deletion is performed. A real retention/archival design must preserve audit evidence and be reviewed before changing these limits.

## Reproducible tests

```sh
node --test infra/rivercloud/queue.test.mjs infra/rivercloud/server.test.mjs infra/rivercloud/rc11-state.test.mjs
```

## CI feedback and corrections

- Runs #281/#282 failed the Node test step due source-insertion syntax artifacts. They are retained as failed evidence.
- Run #284 also exposed that the queue-cap and state-read-cap guards had not actually been wired into the implementation: the queue cap test and oversized snapshot test failed. The report is not considered verified from that run.
- Run #292 exposed a faulty test fixture in the new idempotent-at-cap regression: it hashed the raw request instead of the canonical validated plan. The failure is documented and the fixture was corrected by computing the digest from `validateDeployRequest(base)`.
- The latest correction commit is `e51f7d8c8f0a3e0dfd724faaaeff36a38e08a34c`. It adds queue/event caps, bounded state reads, write-side size enforcement, and regression tests for item/event limits, duplicate-at-cap, and oversized writes.
- GitHub Actions run **45717007464 (#298) — SUCCESS: 130/130 Node tests, 0 failures**, plus bootstrap shell, backup/restore and Python syntax, Compose config, and Caddy validation. It verifies commit `4a08fa49caf752573a0e73789ab22644bcddebd4`, which includes the correction commit `e51f7d8c8f0a3e0dfd724faaaeff36a38e08a34c` and report updates. The Caddy check used a temporary container; no RiverCloud service or runner was started.
- Earlier failures #281/#282, #284 and #292 remain documented and are not counted as passing.
- Documentation closeout was verified by **45717083964 (#302) — SUCCESS: 130/130 Node tests**, plus the same bootstrap, backup/restore/Python, Compose and Caddy checks. Run #302 verifies report commit `c3cb24593a76bf1dda41bc64a1d4cb0c3fbecbf9` (including the preceding RC-30 doc commit `5391fb79ce231dd9b5f5d9d25dc150a5b7568180`).

This remains a local prototype capacity guard; limits and retention must be revisited before any real deployment.
