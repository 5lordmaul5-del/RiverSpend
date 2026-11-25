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
