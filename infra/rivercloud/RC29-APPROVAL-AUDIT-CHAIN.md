# RC-29 — approval events in the lifecycle audit chain

RC-26's atomic approval transaction persisted approval issuance and consumption in the shared state snapshot, but only the job transition was represented in the RC-17 hash-chain. RC-29 adds explicit chain events for approval issuance and consumption using a SHA-256 identifier of the approval token, not the token itself.

The replay verifier checks the issuance against the pending job and plan digest, validates expiry, rejects repeated consumption, checks separation of duties, and requires the consumption event to be immediately followed by the matching pending-to-approved transition. Lifecycle reads cross-check the persisted approval records against the verified chain.

This remains local tamper-evidence: the chain is unkeyed, the store is local, and the actor labels are not authenticated by the lifecycle module. An attacker able to rewrite the store and recompute hashes can forge records. RC-29 does not implement a remote WORM sink or OIDC route integration.

## Reproducible tests

```sh
node --test infra/rivercloud/rc17-atomic-lifecycle.test.mjs infra/rivercloud/approval-bound.test.mjs infra/rivercloud/approval-process.test.mjs infra/rivercloud/rc22-approval-identity.test.mjs
```


### CI feedback

- Run **45715459971 (#271)** failed: 97/102 Node tests passed; five test-file imports failed at the module syntax error caused by a literal escaped newline in the inserted constant. Subsequent validation steps were skipped. The syntax correction is committed separately and awaits fresh CI.


### RC-29 CI closeout — verified

- The initial RC-29 code commit `e0cb76806328bc0528116f9de31abd8abb214a4a` failed runs **45715459971 (#271)** and **45715470523 (#272)**: 97/102 Node tests passed, with five import/syntax failures caused by a literal escaped newline in the module insertion.
- The intermediate correction commit `a886d64c58cd0be6d787d20671ac0b2fd67cb17c` also failed runs **45715556448 (#273)** and **45715569522 (#274)** because additional escaped newline artifacts remained.
- Corrected code commit `da9a0f7941c39afb1907267e797648fa45f6b7da` was verified by GitHub Actions **45715617333 (#275) — SUCCESS: 124/124 Node tests** and PR run **45715626427 (#276) — SUCCESS: 124/124 Node tests**. Both passed bootstrap shell syntax, backup/restore and Python extractor syntax, Compose validation, and Caddy validation.
- These failures are documented and not counted as passing. No RiverCloud services or runner were started. The Caddy validation used the workflow's temporary container only.
