# RC-14 — protected external audit sink (contract prototype)

## Prototype
- Canonical audit envelope with schema, sink identifier, actor, timestamp, event type, data and previous hash reference.
- Allowlisted event types only.
- Recursive key-based redaction and depth/array/string bounds.
- SHA-256 envelope digest with an exported verifier that detects envelope tampering.
- HMAC-SHA256 delivery descriptor requiring HTTPS and a 32+ character signing secret.
- URL descriptors reject userinfo, query and fragment.
- An exported verifier checks the envelope hash, HMAC and timestamp freshness (configurable bounded clock window).
- Generates/validates delivery descriptors only: no outbound network requests or secret storage are implemented.

## Production requirements
- Select a dedicated independent audit provider/account with access separation and retention controls.
- Authenticate sink delivery; verify timestamp/signature and enforce replay prevention at receiver (deduplicate by envelope hash).
- Use key management/secrets vault, rotation and revocation; never store signing secret in repository.
- Configure append-only/WORM retention, access monitoring, backup and alerting.
- Prevent network SSRF: destination allowlisting, DNS/IP validation at connection time, no private/link-local addresses, redirects disabled, outbound policy enforced.
- Reliable delivery queue, retries with backoff, deduplication, outage alerting, and policy for fail-closed/fail-open decisions.
- Review event schema, data minimization, privacy, legal retention and tamper response.

## Limitations
This remains a sender/verifier contract prototype. Verification is not a receiver, replay store, delivery queue, or immutable storage. No external sink has been provisioned or connected. No production deployment or execution.


### RC-27 replay guard contract

Signed delivery descriptors now include a 128-bit random nonce, and the HMAC covers timestamp, nonce, and exact body. Verification is asynchronous and fails closed unless a `consumeReplay` callback is supplied; the callback must atomically persist/reject the nonce in a durable receiver-side replay store. This prototype does not implement or provision that store and performs no network delivery.
