# RC-46 — separate queue events from the audit ledger

## Finding

The queue and approval helpers append operational events into `state.events`. The RC-8 hash-chained audit ledger also used that same field and expected every record there to carry a ledger sequence, previous hash and record hash. Mixing the two record types would invalidate the ledger verification and make the stores incompatible.

## Correction

- The RC-8 hash-chained ledger now persists in a separate `auditLogRecords` array within the RC-11 snapshot.
- Operational queue/event records continue to use `events`; the audit ledger no longer consumes or validates that unrelated array.
- The ledger fails closed for a non-array field, integrity errors, and at a fixed 10,000-record cap.
- Regression tests exercise queue creation followed by audit append, ensure the two arrays remain separate, and check independent capacity, concurrent chain order, redaction and tampering.

## Verification status

- Code and test changes committed on the isolated PR branch.
- CI pending; no local test pass claimed.
- No runner, services, staging host, deployment, merge, production data/credentials, provisioning or spending.

## Reproduce

```sh
node --test infra/rivercloud/audit-log.test.mjs infra/rivercloud/queue.test.mjs
```


## RC-46 CI closeout (26 November 2026)

- Code/test commit `3348c1e26166d7034ab00fc78cb7bae05683b0b6`: GitHub Actions **45765929407 (#401) — SUCCESS, 154/154 Node tests**, 0 failures; bootstrap shell, backup/restore and Python syntax, restore directory-replacement race, Compose, API image build/inspection and Caddy validation all passed.
- Report/document closeout commit `15d30cdd20661315d42602792977c7512c859ddf`: GitHub Actions **45765947186 (#404) — SUCCESS, 154/154 tests**, plus the same shell/Python, restore race, Compose, API image build/inspection and Caddy validation suite.
- No RiverCloud services or runner were started; no real deployment, merge, provisioning, production data/credentials or spending.
