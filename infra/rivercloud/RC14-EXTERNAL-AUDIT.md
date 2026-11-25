# RC-14 — protected external audit sink (contract prototype)

## Prototype
- Canonical audit envelope with schema, sink identifier, actor, timestamp, event type, data and previous hash reference.
- Allowlisted event types only.
- Recursive key-based redaction and size/depth bounds on basic values.
- SHA-256 envelope digest and HMAC-SHA256 signed delivery descriptor requiring HTTPS and a 32+ character secret.
- Generates a delivery descriptor only: no outbound network requests or secret storage are implemented.

## Production requirements
- Select a dedicated independent audit provider/account with access separation and retention controls.
- Authenticate sink delivery; verify timestamp/signature and enforce replay prevention at receiver.
- Use key management/secrets vault, rotation and revocation; never store signing secret in repository.
- Configure append-only/WORM retention, access monitoring, backup and alerting.
- Prevent network SSRF: destination allowlisting, DNS/IP validation at connection time, no private/link-local addresses, redirects disabled, outbound policy enforced.
- Reliable delivery queue, retries with backoff, deduplication, outage alerting, and policy for fail-closed/fail-open decisions.
- Review event schema, data minimization, privacy, legal retention and tamper response.

## Limitations
Prototype code and tests are authored but not runtime-verified. Hashing/signing does not itself guarantee delivery, immutability, or trust. No external sink has been provisioned or connected. No production deployment or execution.
