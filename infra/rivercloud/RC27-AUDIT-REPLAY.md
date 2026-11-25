# RC-27 — replay guard contract for signed audit delivery

Signed audit-delivery descriptors now include a random 128-bit nonce. The HMAC covers the timestamp, nonce and exact serialized body.

Verification is asynchronous and **fails closed** unless the caller supplies `consumeReplay`. The callback must atomically persist/reject the nonce in a durable receiver-side replay store; a false result is treated as replay rejection, and callback errors are treated as storage failure.

This increment does not implement the replay database, receiver, network delivery or retention policy. It is a contract and testable prototype, not an external immutable audit service.

## Reproducible test

```sh
node --test infra/rivercloud/rc14-audit-sink.test.mjs
```
