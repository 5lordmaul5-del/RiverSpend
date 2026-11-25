# RC-27 — replay guard contract for signed audit delivery

Signed audit-delivery descriptors now include a random 128-bit nonce. The HMAC covers the timestamp, nonce and exact serialized body.

Verification is asynchronous and **fails closed** unless the caller supplies `consumeReplay`. The callback must atomically persist/reject the nonce in a durable receiver-side replay store; a false result is treated as replay rejection, and callback errors are treated as storage failure.

This increment does not implement the replay database, receiver, network delivery or retention policy. It is a contract and testable prototype, not an external immutable audit service.

## Reproducible test

```sh
node --test infra/rivercloud/rc14-audit-sink.test.mjs
```


## CI closeout

- GitHub Actions run **45708327208 (#247) — SUCCESS: 122/122 Node tests**, and PR run **45708344831 (#248) — SUCCESS: 122/122** verify code commit `92cadbb4218cb37f730c00c72dfb5b54c16084e3`. Both also passed bootstrap, backup/restore/Python syntax, Compose validation and Caddy validation. No network delivery or services were started.
