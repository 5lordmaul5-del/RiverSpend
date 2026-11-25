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
