# RC-30 — queue and store capacity bounds

The local queue is bounded to 5,000 job entries and 10,000 events; duplicate plan submissions are checked before the cap so retries remain idempotent. The RC-11 state-file reader rejects snapshots above 8 MiB before JSON parsing. Capacity and oversized-state errors map to HTTP 503.

No automatic pruning or deletion is performed. A real retention/archival design must preserve audit evidence and be reviewed before changing these limits.

## Reproducible tests

```sh
node --test infra/rivercloud/queue.test.mjs infra/rivercloud/server.test.mjs infra/rivercloud/rc11-state.test.mjs
```


### CI feedback

- Runs #281/#282 failed before the full suite due literal escaped newline artifacts in the source insertion. The correction is committed separately; capacity guard verification remains pending.
