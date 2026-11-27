# RC-203 — RiverSSAI BankFlow Intelligence Sandbox

This isolated prototype models a fictional payment flow without connecting to banks, payment networks, real accounts, credentials or APIs.

## Lifecycle
1. Create a transfer between SIM-prefixed fictional accounts.
2. Authorize it using a SIM-prefixed approver identity.
3. Execute only after authorization; apply sandbox balance and optional limit checks.
4. Emit an audit trail and simulated receipt.

## Safeguards
- Rejects non-SIM account identifiers.
- No network access or real payment integration.
- EUR only; positive amounts only.
- Idempotency-key support.
- Basic simulated limit review and insufficient-balance rejection.

## Limitations
This is a prototype, not a secure financial ledger or bank emulator. Authorization identities are syntactic placeholders, not authenticated identities. Balances are in-memory, no atomic persistence, no real daily aggregation, no cryptographic audit, no regulatory compliance guarantees. Never use for real money.

## Next
Add scenario generation, risk/anomaly detection, API mock fixtures, durable sandbox persistence, test coverage and review before integration.
