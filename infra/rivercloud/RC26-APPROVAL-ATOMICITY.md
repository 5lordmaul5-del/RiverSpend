# RC-26 — approval consumption and lifecycle transition in one transaction

The approval issuer now requires an existing lifecycle job in `pending` state with a matching digest. Issuance and the approval record are written to the same RC-11 state snapshot.

Consumption now validates the one-use token, binding, expiry, distinct consumer, pending job, digest and current audit replay **inside the same transaction** that marks the approval used, moves the job to `approved`, appends the `approval_consumed` event, and records the lifecycle hash-chain transition.

This is still a local single-file prototype. Actor labels are not cryptographically authenticated by these functions, route-level OIDC/RBAC is not wired, and no runner or deployment is enabled.

## Reproducible test

```sh
node --test infra/rivercloud/approval-bound.test.mjs infra/rivercloud/approval-process.test.mjs infra/rivercloud/rc22-approval-identity.test.mjs infra/rivercloud/rc17-atomic-lifecycle.test.mjs
```

The process-race test must leave exactly one approved job, one used token, and a valid lifecycle/audit snapshot. Any failed transition must leave the token unconsumed.


## CI closeout

- GitHub Actions **run 45708072045 (#243) — SUCCESS: 119/119 Node tests** and PR run **45708081331 (#244) — SUCCESS: 119/119** verify code/test commit `96ce2ce439a31cd453ab41862a88d1f323e5d426`. Both also passed bootstrap, backup/restore and Python syntax, Compose validation, and Caddy validation. The earlier fixture-failure runs #241/#242 were corrected and retained in the report.


## RC-29 — approval issuance and consumption are hash-chained

Approval issuance and consumption now appear as explicit records in the same lifecycle hash-chain, in addition to the job-transition records. The verifier requires a consumed-approval record to be followed immediately by its matching pending-to-approved transition. Lifecycle reads cross-check each stored approval against the verified chain. This is local tamper-evidence, not a keyed signature or remote immutable ledger.


### RC-29 correction note

The first RC-29 CI run (#271) exposed a literal escaped newline in the module constant insertion. The corrected branch commit replaces it with a source newline; test verification remains pending.


### RC-29 CI closeout — verified

- The initial RC-29 code commit `e0cb76806328bc0528116f9de31abd8abb214a4a` failed runs **45715459971 (#271)** and **45715470523 (#272)**: 97/102 Node tests passed, with five import/syntax failures caused by a literal escaped newline in the module insertion.
- The intermediate correction commit `a886d64c58cd0be6d787d20671ac0b2fd67cb17c` also failed runs **45715556448 (#273)** and **45715569522 (#274)** because additional escaped newline artifacts remained.
- Corrected code commit `da9a0f7941c39afb1907267e797648fa45f6b7da` was verified by GitHub Actions **45715617333 (#275) — SUCCESS: 124/124 Node tests** and PR run **45715626427 (#276) — SUCCESS: 124/124 Node tests**. Both passed bootstrap shell syntax, backup/restore and Python extractor syntax, Compose validation, and Caddy validation.
- These failures are documented and not counted as passing. No RiverCloud services or runner were started. The Caddy validation used the workflow's temporary container only.
