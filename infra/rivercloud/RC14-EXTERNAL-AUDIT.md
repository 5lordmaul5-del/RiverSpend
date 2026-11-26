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


### RC-27 verification evidence

- Runs #247/#248 verified the replay-guard contract and all 122 Node tests, plus bootstrap, backup/restore/Python, Compose and Caddy validation. No receiver or network delivery was implemented or started.


### RC-27 report-only CI closeout

- Report/doc commit `09cbd6bccc8e6dd7581a8b923f58f4769c3a7dbe` was verified by **45708424593 (#249) and 45708437672 (#250) — SUCCESS: 122/122 tests** each, plus bootstrap, backup/restore and Python syntax, Compose configuration, and Caddy validation. The source code is unchanged from the verified RC-27 code commit.


### RC-27 report-only commit verification

- The report-only commit `63a30d6da170a301df0a29fad5241bd5c2dbc07c` was verified by GitHub Actions **45708543769 (#251) and 45708555561 (#252) — SUCCESS: 122/122 tests** each, plus bootstrap, backup/restore/Python, Compose configuration and Caddy validation. The code was unchanged from RC-27's verified source commit.

## Audit data preflight correction

- The previous redactor used `Object.entries`, which could invoke nested getters during redaction or envelope verification and silently accepted sparse/cyclic structures via truncation.
- The prototype now snapshots event and envelope properties through data descriptors; nested accessor properties, sparse arrays, cycles and oversized object/array shapes fail closed. Special own keys are still redacted and preserved safely using null-prototype snapshots.
- Regression tests cover accessor non-execution, sparse/cyclic rejection and verifier fail-closed behavior.
- GitHub Actions is pending for this correction at the time of this note.
